import { Router } from "express";
import { getRepository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Users } from "../entities/User";     // A Users entitás
import { Posts } from "../entities/Post";     // A Posts entitás
import { Comments } from "../entities/Comment"; // A Comments entitás
import { tokencheck } from "../utiles/tokenUtils";

const router = Router();
const comments = AppDataSource.getRepository(Comments);
// 1. Kommentek listázása egy adott poszthoz
router.get('/post/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    const commentRepository = AppDataSource.getRepository(Comments);
    const comments = await commentRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'parent', 'children'],
      order: { createdAt: 'ASC' },
    });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// 2. Új komment hozzáadása egy poszthoz
router.post("/:postId", tokencheck, async (req:any, res:any) => {
    const { text, parentId } = req.body;
    const userId = req.user.id;
    const postId = req.params.postId;

    try {
        const postRepo = AppDataSource.getRepository(Posts);
        const userRepo = AppDataSource.getRepository(Users);
        const commentRepo = AppDataSource.getRepository(Comments);

        const post = await postRepo.findOne({ where: { id: postId } });
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!post || !user) {
            return res.status(404).json({ message: "Post or user not found" });
        }

        const newComment = new Comments();
        newComment.text = text;
        newComment.user = user;
        newComment.post = post;
        newComment.parentId = parentId || null;

        if (parentId) {
            const parentComment = await commentRepo.findOne({ where: { id: parentId } });
            if (parentComment) {
                newComment.parent = parentComment;
            } else {
                return res.status(404).json({ message: "Parent comment not found" });
            }
        }

        await commentRepo.save(newComment);
        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating comment" });
    }
});

// 3. Komment frissítése (pl. szerkesztés)
router.put("/:commentId", tokencheck, async (req:any, res:any) => {
    const { text } = req.body;
    const commentId = req.params.commentId;

    try {
        const comment = await AppDataSource.getRepository(Comments).findOne({ where: { id: commentId } });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Ellenőrzés, hogy a felhasználó a saját kommentjét próbálja-e szerkeszteni
        if (comment.userId !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to edit this comment" });
        }

        comment.text = text;
        await AppDataSource.getRepository(Comments).save(comment);

        res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating comment" });
    }
});
// 4. Komment törlése
router.delete("/:commentId", tokencheck, async (req: any, res: any) => {
  const commentId = req.params.commentId;

  try {
    const commentRepo = AppDataSource.getRepository(Comments);
    const comment = await commentRepo.findOne({ where: { id: commentId } });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }


    await commentRepo.remove(comment);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

export default router;
