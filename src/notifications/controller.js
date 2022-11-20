import Notification from "./model.js"
export const list ={
    do:async (req, res, next) => {
        const notifications = await Notification.find()
        res.status(200).json({
            ok:true,
            notifications
        })
    }
}