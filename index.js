const expres = require('express')
const app = expres()

const dotenv = require('dotenv').config()
const connectDB = require('./config/db')

const userRoutes = require('./routes/userRoutes')


app.use(expres.json())
connectDB()


app.use("/api/user", userRoutes)






app.get('/', (req, res) => {
    res.send('Hello World') 
})  
app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`)                                                                                    )