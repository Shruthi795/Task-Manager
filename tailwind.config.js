/* General body styling */
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

/* Container for forms */
.login-container,
.signup-container {
  background-color: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  width: 350px;
}

/* Form inputs */
input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

/* Buttons */
button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
}

button:hover {
  background-color: #0056b3;
}

/* Messages */
p {
  margin-top: 10px;
  font-size: 0.9rem;
}

p.error {
  color: red;
}

p.success {
  color: green;
}

/* Heading */
h2 {
  text-align: center;
  margin-bottom: 1rem;
}
