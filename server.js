const express=require('express');
const app=express();
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'freddy',
  database: 'proyecto', 
  password: 'nikita'
});
const session=require('express-session');
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('styles'));


//Se usa path para poder usar el metodo que une la ruta de la aplicacion y la plantilla html a enviar
const path=require('path');
app.get('/', (req, res)=>{
  if (req.isAuthenticated()){
    res.redirect('/home');
  } else{
  	res.sendFile(path.join(__dirname, 'index.html'));
  }
});

//Registro de usuario. Se reciben los datos desde el objeto req, y se insertan en la base de datos
app.post('/signup', (req, res)=>{
  try{
    connection.query(`INSERT INTO users VALUES('${req.body.email}', '${req.body.username}', '${req.body.password}');`, function(err, results, fields) {
      res.redirect('/sucess');
    });
  } catch(err){
  	console.log(err);
  	res.redirect('/error');
  }
});
//Plantillas que se muestran al usuario indicando el resultado del registro
app.get('/sucess', (req, res)=>{
  res.sendFile(path.join(__dirname, 'sucess.html'));
});

app.get('/error', (req, res)=>{
  res.sendFile(path.join(__dirname, 'error.html'));
});
//Uso del modulo passport para iniciar sesion. El username en este caso es el correo
passport.use(new LocalStrategy(function verify(username, password, cb){
  connection.query(`SELECT * FROM users WHERE email='${username}' AND password='${password}'`, function(err, result, fields){
    if (err) {return cb(err); };
    if (result.length===0) { /*Result es un array que deberia contener los datos del usuario en forma de objeto. Si la longitud
    	del array es cero, entonces las credenciales son incorrectas*/
      return cb(null, false, { message: 'Incorrect username or password.' }); 
    } else if (result.length===1){
	  return cb(null, result);
    }
    return cb(null, result);
  });
}));

//Codigo para serializar al usuario, sirve para mantener la sesion.
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user[0].email, username: user[0].username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

//Redireccion derivada del resultado del inicio de sesion del usuario. Caso exitoso se redirige a la pagina principal.
app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/'
}));

app.get('/home', (req, res)=>{
  res.sendFile(path.join(__dirname, '/principal.html'));
});

const port=5000;
app.listen(port, () => {  
  console.log('Servidor iniciado');
});

