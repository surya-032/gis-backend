const db = require("../config/db");

exports.getAllMarkers = async (req, res) => {
    try {
      const [markers] = await db.promise().query("SELECT * FROM markers");
      res.json(markers);
    } catch (error) {
      console.error("Error fetching markers:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };

exports.getMarkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [marker] = await db.promise().query("SELECT * FROM markers WHERE id = ?", [id]);

    if (marker.length === 0) {
      return res.status(404).json({ message: "Marker not found" });
    }
    res.json(marker[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createMarker = async (req, res) => {
  try {
    const { name, latitude, longitude, description } = req.body;
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: "Name, latitude, and longitude are required" });
    }

    await db.promise().query(
      "INSERT INTO markers (name, latitude, longitude, description) VALUES (?, ?, ?, ?)",
      [name, latitude, longitude, description]
    );
    res.status(201).json({ message: "Marker created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMarker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, description } = req.body;

    await db.promise().query(
      "UPDATE markers SET name=?, latitude=?, longitude=?, description=? WHERE id=?",
      [name, latitude, longitude, description, id]
    );
    res.json({ message: "Marker updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMarker = async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query("DELETE FROM markers WHERE id = ?", [id]);
    res.json({ message: "Marker deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
