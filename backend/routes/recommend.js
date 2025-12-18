const express = require("express");
const Item = require("../models/Item");
const fetch = require("node-fetch"); // npm install node-fetch@2

const router = express.Router();

/**
 * POST /api/recommend
 * Body: { itemId }
 * Returns internal Mongo recommendations (same category)
 */
router.post("/", async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: "itemId is required" });
    }

    const current = await Item.findById(itemId);
    if (!current) {
      return res.status(404).json({ error: "Item not found" });
    }

    // SIMPLE: same category, different item
    const query = {
      _id: { $ne: current._id },
      category: current.category,
    };

    const recommendations = await Item.find(query)
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ items: recommendations });
  } catch (err) {
    console.error("RECOMMEND ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

/**
 * POST /api/recommend/books
 * Body: { itemId }
 * Returns external Google Books recommendations
 */
router.post("/books", async (req, res) => {
  try {
    const { itemId } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId is required" });

    const item = await Item.findById(itemId);
    if (!item || item.category !== "book") {
      return res.status(400).json({ error: "Item must be a book" });
    }

    const query = encodeURIComponent(item.title || "");
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&maxResults=5`;

    const resp = await fetch(url);
    const data = await resp.json();

    const books = (data.items || []).map((b) => {
      const info = b.volumeInfo || {};
      return {
        _id: b.id,
        title: info.title,
        category: "book",
        description: info.description || "",
        author: (info.authors && info.authors.join(", ")) || "",
        location: "",
        salary: "",
        link: info.infoLink,
        image:
          info.imageLinks &&
          (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail),
      };
    });

    res.json({ items: books });
  } catch (err) {
    console.error("BOOK RECOMMEND ERROR:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
