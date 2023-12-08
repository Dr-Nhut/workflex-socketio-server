const { addMessage, getAllMessages, getMessagesByUser, } = require("../controllers/messagesController")

const router = require("express").Router()

router.get("/messages/:id", getMessagesByUser);

router.post("/get-all-messages", getAllMessages);
router.post("/add-message", addMessage);

module.exports = router