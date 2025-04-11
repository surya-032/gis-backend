const db = require("../config/db");

exports.getAllRoutes = async (req, res) => {
  try {
    const [routes] = await db.promise().query("SELECT * FROM routes");

    const routesWithPoints = await Promise.all(
      routes.map(async (route) => {
        const [points] = await db.promise().query(
          "SELECT latitude, longitude, position FROM route_points WHERE route_id = ? ORDER BY position",
          [route.id]
        );
        return { ...route, points };
      })
    );

    res.json(routesWithPoints);
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const [route] = await db.promise().query("SELECT * FROM routes WHERE id = ?", [id]);

    if (route.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    const [points] = await db.promise().query(
      "SELECT latitude, longitude, position FROM route_points WHERE route_id = ? ORDER BY position",
      [id]
    );

    res.json({ ...route[0], points });
  } catch (error) {
    console.error("Error fetching route by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const { name, description, points } = req.body;

    if (!name || !points || points.length === 0) {
      return res.status(400).json({ message: "Nama dan setidaknya satu titik koordinat diperlukan" });
    }

    const [result] = await db.promise().query(
      "INSERT INTO routes (name, description) VALUES (?, ?)",
      [name, description]
    );
    const routeId = result.insertId;

    const values = points.map((point, index) => [routeId, point.latitude, point.longitude, index + 1]);
    await db.promise().query(
      "INSERT INTO route_points (route_id, latitude, longitude, position) VALUES ?",
      [values]
    );

    res.status(201).json({ message: "Route created successfully", routeId });
  } catch (error) {
    console.error("Error creating route:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, points } = req.body;

    const [existingRoute] = await db.promise().query("SELECT * FROM routes WHERE id = ?", [id]);
    if (existingRoute.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    await db.promise().query(
      "UPDATE routes SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, description, id]
    );

    await db.promise().query("DELETE FROM route_points WHERE route_id = ?", [id]);

    if (points && points.length > 0) {
      const values = points.map((point, index) => [id, point.latitude, point.longitude, index + 1]);
      await db.promise().query(
        "INSERT INTO route_points (route_id, latitude, longitude, position) VALUES ?",
        [values]
      );
    }

    res.json({ message: "Route updated successfully" });
  } catch (error) {
    console.error("Error updating route:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    await db.promise().query("DELETE FROM route_points WHERE route_id = ?", [id]);

    await db.promise().query("DELETE FROM routes WHERE id = ?", [id]);

    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({ message: "Server error" });
  }
};
