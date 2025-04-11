const express = require("express");
const { register, login, getUserById } = require("./controllers/userController");
const authMiddleware = require("./middlewares/authMiddleware");
const markerController = require("./controllers/markerController");
const routeController = require("./controllers/routeController");
const polygonController = require("./controllers/polygonController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", authMiddleware, getUserById);

router.get("/markers", markerController.getAllMarkers);
router.post("/markers", markerController.createMarker);
router.get("/markers/:id", markerController.getMarkerById);
router.put("/markers/:id", markerController.updateMarker);
router.delete("/markers/:id", markerController.deleteMarker);

router.get("/routes", routeController.getAllRoutes); 
router.get("/routes/:id", routeController.getRouteById); 
router.post("/routes", routeController.createRoute);
router.put("/routes/:id", routeController.updateRoute);
router.delete("/routes/:id", routeController.deleteRoute);

router.get("/polygons", polygonController.getAllPolygons); 
router.get("/polygons/:id", polygonController.getPolygonById); 
router.post("/polygons", polygonController.createPolygon);
router.put("/polygons/:id", polygonController.updatePolygon); 
router.delete("/polygons/:id", polygonController.deletePolygon);

module.exports = router;
