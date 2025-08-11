const expres = require('express')
const dotenv = require('dotenv').config()

const app = expres()
app.use(expres.json())


app.get('/', (req, res) => {
    res.send('Hello World') 
})  
app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`)                                                                                    )