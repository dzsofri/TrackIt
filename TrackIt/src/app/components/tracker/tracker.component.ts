  import { CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { ApiService } from '../../services/api.service';
  import { ActivatedRoute } from '@angular/router';
  import { AuthService } from '../../services/auth.service';
  import { MessageService } from '../../services/message.service';
  import { HttpClient } from '@angular/common/http';
  import { CustomtrackerComponent } from '../customtracker/customtracker.component';
  import { AlertModalComponent } from '../alert-modal/alert-modal.component';
  import { NewhabitComponent } from '../newhabit/newhabit.component';
  import { Chart } from 'chart.js';


  @Component({
    selector: 'app-tracker',
    standalone: true,
    imports: [CommonModule, FormsModule, NewhabitComponent, AlertModalComponent],
    templateUrl: './tracker.component.html',
    styleUrl: './tracker.component.scss'
  })
  export class TrackerComponent {
    constructor(
      private api: ApiService,
      private auth: AuthService,
      private activatedRoute: ActivatedRoute,
      private message: MessageService,
      private http: HttpClient
    ) {}

completed: boolean = false;  // default value

    value: number | null = null;
    unit = 'liter';
    units = ['liter', 'mililiter', 'óra', 'perc', 'méter', 'kilométer'];
    date = new Date().toISOString().split('T')[0];
    currentYear = new Date().getFullYear();
    currentMonth = new Date().getMonth();
  
    
    touchStartX = 0;
    startDate = new Date().toISOString().split('T')[0];
    intervalDays = 1;
    isPopupOpen = false;
    id = '';
    user: any;
    userNames: { [key: string]: string } = {};
    imagePreviewUrl = '/assets/images/profileKep.png';
    activeTab = 'watertracker';
    modalVisible = false;
    modalType: 'error' | 'success' | 'warning' | 'info' = 'info';
    modalMessage = '';
    habitList: { id: string, 
      habitName: string,
       status: string, 
       targetValue?: number, 
       currentValue?: number, 
       completed: boolean,
       startDate: string
     }[] = [];

    selectedHabit: {
      completedToday: string;
      targetValue: null;
      unit: string;
      startDate: string;
      intervalDays: number;
      currentValue: number ; 
      dailyTarget: number;
      id: string, 
      habitName: string, 
      status: string,
       completed: boolean
  
  } | null = null;
    habitChart: Chart | undefined;

  invalidFields: string[] = [];
  modalButtons = [
    { label: 'OK', action: () => this.onModalClose() }
  ];

today = new Date().toISOString().split('T')[0];



  onModalClose() {
    this.modalVisible = false;
  }






    ngOnInit(): void {
      this.id = this.activatedRoute.snapshot.params['id'];
      this.auth.user$.subscribe(user => {
        if (user) {
          this.id = user.id;
          this.user = { id: user.id };
          this.fetchUser();
          this.fetchHabits();
          this.fetchUserProfilePicture();
          this.scheduleMidnightReset(); // <-- EZT ADD HOZZÁ
        }
      });
    }

    fetchUser(): void {
      this.api.getLoggedUser('users', this.id).subscribe({
        next: (res: any) => {
          this.user = res.user;
          if (this.user && this.user.id) {
            this.userNames[this.user.id] = this.user.name ?? 'Ismeretlen felhasználó';
          }
        },
        error: (err) => console.error('Error fetching user data:', err)
      });
    }

    fetchUserProfilePicture(): void {
      const token = localStorage.getItem('trackit');
      if (!token) return;

      this.http.get<{ imageUrl: string | null }>('http://localhost:3000/users/profile-picture', {
        headers: { Authorization: `Bearer ${token}` },
      }).subscribe({
        next: (response) => this.imagePreviewUrl = response.imageUrl || '/assets/images/profileKep.png',
        error: () => this.imagePreviewUrl = '/assets/images/profileKep.png',
      });
    }
fetchHabits(): void {
  const token = localStorage.getItem('trackit');
  if (!token) return;

  this.api.getHabitsForUser(this.id, token).subscribe({
    next: (res: any[]) => {
      this.habitList = res.map(habit => ({
        id: habit.id,
        habitName: habit.habitName,
        status: habit.status,
        targetValue: habit.targetValue,
        currentValue: habit.currentValue,
        dailyTarget: habit.dailyTarget,
        completed: habit.completed,
        startDate: habit.startDate, // Lehet, hogy a startDate is elérhető a backendről
      
      }));

      console.log(this.habitList);

      if (this.selectedHabit) {
        this.onHabitChange();
      }

      this.loadHabitChart();
    },
    error: (err) => console.error('Hiba a szokások betöltésekor:', err)
  });
}



    openNewHabitModal() { this.isPopupOpen = true; }
    closeNewHabitModal() { this.isPopupOpen = false; }

onHabitChange(): void {
  if (this.selectedHabit) {
    this.value = this.selectedHabit.targetValue ?? null;
    this.unit = this.selectedHabit.unit ?? 'liter';
    this.startDate = this.selectedHabit.startDate ?? new Date().toISOString().split('T')[0];
    this.intervalDays = this.selectedHabit.intervalDays ?? 1;
    this.completed = (this.selectedHabit.currentValue ?? 0) > 0;
  }
}




    
    submit(): void {
      if (!this.selectedHabit || this.value === null || !this.startDate || this.intervalDays <= 0) {
        this.modalMessage = 'Kérlek, tölts ki minden mezőt!';
        this.modalType = 'warning';
        this.modalVisible = true;
        return;
      }

      const start = new Date(this.startDate);
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < this.intervalDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        this.api.addHabitTrackingRecord({
          habitId: this.selectedHabit.id,
          achieved: this.completed,
          value: this.value,
          date: currentDate.toISOString().split('T')[0],
        }).subscribe({
          next: () => {
            successCount++;
            if (successCount + errorCount === this.intervalDays) {
              this.modalMessage = `Sikeresen elmentve ${successCount} napra!`;
              this.modalType = 'success';
              this.modalVisible = true;
            }
          },
          error: () => {
            errorCount++;
            if (successCount + errorCount === this.intervalDays) {
              this.modalMessage = `Mentés során ${errorCount} hiba történt.`;
              this.modalType = 'error';
              this.modalVisible = true;
            }
          }
        });
      }
    }

    handleNewHabit(event: { habit: any }): void {
      this.api.createHabit(event.habit).subscribe({
        next: (res) => {
          this.habitList.push(res.habit);
          this.modalMessage = 'Szokás sikeresen létrehozva!';
          this.modalType = 'success';
          this.modalVisible = true;
          this.loadHabitChart();
        },
        error: () => {
          this.modalMessage = 'Hiba történt a szokás létrehozásakor.';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      });
    }

    activateHabit(): void {
      if (!this.selectedHabit) return;

      const token = localStorage.getItem('trackit');
      if (!token) return;

    const payload = {
      habitId: this.selectedHabit.id,
      habitName: this.selectedHabit.habitName,
      status: 'active',
      userId: this.user?.id || this.id
    };

    this.api.updateHabitStatus(payload).subscribe({
        next: () => {
          this.modalMessage = 'A tracker sikeresen aktiválva lett!';
          this.modalType = 'success';
          this.modalVisible = true;
          this.selectedHabit!.status = 'active';
        },
        error: () => {
          this.modalMessage = 'Hiba történt a státusz frissítése közben.';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      });
    }

 loadHabitChart(): void {
  const canvas = document.getElementById('habitChart') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;

  if (this.habitChart) {
    this.habitChart.destroy();
  }

  const habitNames = this.habitList.map(h => h.habitName);
  const currentValues = this.habitList.map(h => h.currentValue ?? 0);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#2f3e34');
  gradient.addColorStop(1, '#6f8372');

  this.habitChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: habitNames,
      datasets: [{
        label: 'Aktuális érték',
        data: currentValues,
        backgroundColor: gradient,
        borderColor: '#3367d6',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Érték'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Szokás'
          }
        }
      }
    }
  });
}


scheduleMidnightReset(): void {
  const now = new Date();
  const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();

  setTimeout(() => {
    this.completed = false;
    if (this.selectedHabit) {
      this.selectedHabit.currentValue = 0;
    }
    console.log('Éjfél: checkbox állapot reset');
    this.scheduleMidnightReset(); // Újraütemezés holnapra
  }, millisTillMidnight);
}


updateHabit(habitId: string, completed: boolean) {
  // Send the update request with a boolean as required by the API
  this.api.updateHabit(habitId, completed).subscribe({
    next: (res) => {
      console.log("Szokás állapota sikeresen frissítve:", res);
      this.modalMessage = 'Szokás állapota sikeresen frissítve!';
      this.modalType = 'success';
      this.modalVisible = true;

      // Update the selectedHabit object using the habit data in the response
      this.selectedHabit = res.habit;  // Assuming res.habit contains the updated habit

      // If needed, also update the habit list
      const updatedHabitIndex = this.habitList.findIndex(habit => habit.id === this.selectedHabit!.id);
      if (updatedHabitIndex !== -1) {
        this.habitList[updatedHabitIndex] = {
          id: this.selectedHabit!.id,
          habitName: this.selectedHabit!.habitName,
          status: this.selectedHabit!.status,
          targetValue: this.selectedHabit!.targetValue ?? undefined,
          currentValue: this.selectedHabit!.currentValue ?? undefined,
          completed: this.selectedHabit!.completed,
          startDate: this.selectedHabit!.startDate
        };
      }

      // Optionally, refresh the habit chart if necessary
      this.loadHabitChart();
    },
    error: (err) => {
      console.error("Hiba történt a szokás frissítése közben:", err);
      this.modalMessage = 'Hiba történt a szokás frissítése közben.';
      this.modalType = 'error';
      this.modalVisible = true;
    }
  });
}
onCheckboxChange() {
  if (!this.selectedHabit) return;  // Ellenőrizzük, hogy a selectedHabit nem null

  const currentDate = new Date().toISOString().split('T')[0];  // A mai nap dátuma (YYYY-MM-DD)

  // Ha már be van pipálva a checkbox és a szokás frissítve lett erre a napra, akkor ne engedjünk új frissítést
  if (this.selectedHabit.completedToday === currentDate) {
    // Ha már frissítve lett a szokás erre a napra, nem engedjük újra frissíteni
    return;
  }

  let currentValue = Number(this.selectedHabit.currentValue);

  if (this.completed) {
    if (this.selectedHabit.targetValue != null) {
      currentValue = Math.min(currentValue + 1, parseInt(this.selectedHabit.targetValue as string, 10));
    } else {
      currentValue = currentValue + 1;
    }
    this.selectedHabit.currentValue = currentValue;
  } else {
    this.selectedHabit.currentValue = currentValue; // No change if not checked
  }

  // Frissítjük a habit állapotát a backend-en
  this.api.updateHabit(this.selectedHabit.id, this.completed).subscribe({
    next: (res) => {
      console.log("Szokás állapota sikeresen frissítve:", res);

      // Ellenőrizzük, hogy van-e `habit` a válaszban, és ha igen, frissítjük
      if (res && res.habit) {
        this.selectedHabit = res.habit;

        // Frissítjük a habit adatokat
        if (this.selectedHabit) {
          this.selectedHabit.completed = this.completed;
          this.selectedHabit.currentValue = res.habit.currentValue;
          this.selectedHabit.completedToday = currentDate;

          // A habit chart frissítése
          this.loadHabitChart();

          this.modalMessage = 'Szokás állapota sikeresen frissítve!';
          this.modalType = 'success';
          this.modalVisible = true;
        }
      } else {
        console.error("Nem található frissített szokás a válaszban.");
        this.modalMessage = 'Hiba történt a szokás frissítése közben.';
        this.modalType = 'error';
        this.modalVisible = true;
      }
    },
    error: (err) => {
      console.error("Hiba történt a szokás frissítése közben:", err);
      this.modalMessage = 'Hiba történt a szokás frissítése közben.';
      this.modalType = 'error';
      this.modalVisible = true;
    }
  });
}

  deleteHabit(): void {
    if (!this.selectedHabit) return;

    if (confirm('Biztosan törölni szeretnéd ezt a szokást?')) {
      this.api.deleteHabit(this.selectedHabit.id).subscribe({
        next: (response) => {
          if (response.message === 'Szokás sikeresen törölve!') {
            this.habitList = this.habitList.filter(h => h.id !== this.selectedHabit?.id);
            this.selectedHabit = null;
            this.modalMessage = 'Szokás törölve!';
            this.modalType = 'success';
            this.modalVisible = true;
            this.loadHabitChart();
          }
        },
        error: () => {
          this.modalMessage = 'Hiba történt a törlés során.';
          this.modalType = 'error';
          this.modalVisible = true;
        }
      });
    }
  }



    setActiveTab(tab: string) {
      this.activeTab = tab;
    }

    

  }
