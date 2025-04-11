const db = require("../config/db");

exports.getAllPolygons = async (req, res) => {
  try {
    const [polygons] = await db.promise().query("SELECT * FROM polygons");
    
    for (const polygon of polygons) {
      const [points] = await db.promise().query(
        "SELECT id, latitude, longitude, position FROM polygon_points WHERE polygon_id = ? ORDER BY position",
        [polygon.id]
      );
      polygon.points = points;
    }

    res.json(polygons);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getPolygonById = async (req, res) => {
  try {
    const { id } = req.params;
    const [polygon] = await db.promise().query("SELECT * FROM polygons WHERE id = ?", [id]);

    if (polygon.length === 0) {
      return res.status(404).json({ message: "Polygon not found" });
    }

    const [points] = await db.promise().query(
      "SELECT id, latitude, longitude, position FROM polygon_points WHERE polygon_id = ? ORDER BY position",
      [id]
    );
    polygon[0].points = points;

    res.json(polygon[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createPolygon = async (req, res) => {
  try {
    const { name, description, points } = req.body;

    if (!name || !points || points.length < 3) {
      return res.status(400).json({ message: "Nama dan minimal 3 titik diperlukan!" });
    }

    const [result] = await db.promise().query(
      "INSERT INTO polygons (name, description) VALUES (?, ?)",
      [name, description]
    );

    const polygonId = result.insertId;

    const pointValues = points.map((point, index) => [polygonId, point[0], point[1], index]);
    await db.promise().query(
      "INSERT INTO polygon_points (polygon_id, latitude, longitude, position) VALUES ?",
      [pointValues]
    );

    res.status(201).json({ message: "Polygon berhasil ditambahkan!" });

  } catch (error) {
    console.error("❌ Error saat menyimpan polygon:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePolygon = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, points } = req.body;

    if (!points || points.length < 3) {
      return res.status(400).json({ message: "Polygon must have at least 3 points" });
    }

    await db.promise().query(
      "UPDATE polygons SET name = ?, description = ? WHERE id = ?",
      [name, description, id]
    );

    await db.promise().query("DELETE FROM polygon_points WHERE polygon_id = ?", [id]);

    for (let i = 0; i < points.length; i++) {
      await db.promise().query(
        "INSERT INTO polygon_points (polygon_id, latitude, longitude, position) VALUES (?, ?, ?, ?)",
        [id, points[i].latitude, points[i].longitude, i + 1]
      );
    }

    res.json({ message: "Polygon updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deletePolygon = async (req, res) => {
  try {
    const { id } = req.params;

    await db.promise().query("DELETE FROM polygons WHERE id = ?", [id]);

    res.json({ message: "Polygon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
