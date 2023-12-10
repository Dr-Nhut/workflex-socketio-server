const { addMessage, getAllMessages, getMessagesByUser, updateMessage } = require("../controllers/messagesController")

const router = require("express").Router()

router.get("/messages/:id", getMessagesByUser);

router.post("/get-all-messages", getAllMessages);
router.post("/add-message", addMessage);

router.patch('/update-message', updateMessage);

module.exports = router