const express = require('express');
const bodyParser = require('body-parser');
const Cloudant = require('@cloudant/cloudant');

const app = express();
const PORT = process.env.PORT || 3300;

const Cloudant = require('@cloudant/cloudant');

const cloudantUsername = 'apikey-v2-12z8jyk91c166b5719im5zpx731mpdk45imsugkbkenl';
const cloudantPassword = '0284cd7f034f3bb3e65dfcbb51376ca1';
const cloudantURL = 'https://apikey-v2-12z8jyk91c166b5719im5zpx731mpdk45imsugkbkenl:0284cd7f034f3bb3e65dfcbb51376ca1@f8b66c9a-c17a-482c-8427-89caebdb50e3-bluemix.cloudantnosqldb.appdomain.cloud';

const cloudant = new Cloudant({
    url: cloudantURL
});

function addRegistrationForm() {
    const body = document.getElementsByTagName('body')[0];

    const formContainer = document.createElement('div');
    formContainer.id = 'form-container';

    const form = document.createElement('form');
    form.id = 'registrationForm';
    form.setAttribute('action', '/register');
    form.setAttribute('method', 'POST');

    form.innerHTML = `
        <h2>User Registration Form</h2>
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required><br><br>
        
        <label for="phone">Phone Number:</label>
        <input type="text" id="phone" name="phone" required><br><br>
        
        <label for="email">Email Address:</label>
        <input type="email" id="email" name="email" required><br><br>
        
        <label for="city">City:</label>
        <input type="text" id="city" name="city" required><br><br>
        
        <label for="country">Country:</label>
        <input type="text" id="country" name="country" required><br><br>
        
        <label for="pincode">Pincode:</label>
        <input type="text" id="pincode" name="pincode" required><br><br>
        
        <button type="submit">Register</button>
    `;

    formContainer.appendChild(form);
    body.appendChild(formContainer);
}

addRegistrationForm();

const dbName = 'user_registration';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
    const { name, phone, email, city, country, pincode } = req.body;

    const db = cloudant.db.use(dbName);

    try {
        const result = await db.insert({
            name,
            phone,
            email,
            city,
            country,
            pincode
        });
        res.send('Registration successful!');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user. Please try again later.');
    }
});

app.get('/users', async (req, res) => {
    const db = cloudant.db.use(dbName);

    try {
        const result = await db.list({ include_docs: true });
        const users = result.rows.map(row => row.doc);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users. Please try again later.');
    }
});

app.get('/users/:id', async (req, res) => {
    const userId = req.params.id;

    const db = cloudant.db.use(dbName);

    try {
        const user = await db.get(userId);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        if (error.statusCode === 404) {
            res.status(404).send('User not found.');
        } else {
            res.status(500).send('Error fetching user. Please try again later.');
        }
    }
});

app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const userData = req.body;

    const db = cloudant.db.use(dbName);

    try {
        const user = await db.get(userId);
        const updatedUser = await db.insert({ ...user, ...userData });
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user. Please try again later.');
    }
});

app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    const db = cloudant.db.use(dbName);

    try {
        const user = await db.get(userId);
        const result = await db.destroy(user._id, user._rev);
        res.json(result);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Error deleting user. Please try again later.');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
