import jwt from "jsonwebtoken";
import express, { Request, Response, NextFunction, Router } from "express";
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";  // Ensure you set this in your .env

// Function to generate JWT
function generateToken(user: any) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}


function tokencheck(req: any, res: any, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(400).send('Jelentkezz be!');
  }

  const token = authHeader.split(' ')[1]; // A Bearer token kinyerése
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded); // Dekódolt token kiíratása
    req.user = decoded;  // A dekódolt tokenet hozzárendeled a req.user-hez
    next(); // Ha érvényes a token, megy tovább
  } catch (error) {
    return res.status(400).send('Hibás vagy lejárt token!');
  }
}
  
export  {generateToken, tokencheck};
//
 