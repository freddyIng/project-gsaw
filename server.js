const express=require('express');
const app=express();
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'proyecto', 
  password: ''
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
app.use(express.static('scripts'));
app.use(express.static('animated'));


//Se usa path para poder usar el metodo que une la ruta de la aplicacion y la plantilla html a enviar
const path=require('path');
app.get('/', (req, res)=>{
  if (req.isAuthenticated()){
    res.redirect('/home');
  } else{
  	res.sendFile(path.join(__dirname, '/index.html'));
  }
});

//Registro de usuario. Se reciben los datos desde el objeto req, y se insertan en la base de datos
app.post('/signup', (req, res)=>{
  try{
    connection.query(`INSERT INTO users VALUES('${req.body.email}', '${req.body.username}', '${req.body.password}');`, function(err, results, fields) {
      if (err){
      	console.log(err);
        res.json({message: 'Error'});
      } else{
        res.json({message: 'Operacion exitosa!'})
      }
    });
  } catch(err){
  	console.log(err);
  	res.json({message: 'Error'});
  }
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

//Rutas
app.get('/home', (req, res)=>{
  res.sendFile(path.join(__dirname, '/principal.html'));
});

app.get('/social', (req, res)=>{
  res.sendFile(path.join(__dirname, '/social.html'));
});

app.get('/clima', (req, res)=>{
  res.sendFile(path.join(__dirname, '/clima.html'));
});

app.get('/gestion', (req, res)=>{
  res.sendFile(path.join(__dirname, '/gestion.html'));
});

app.get('/transito', (req, res)=>{
  res.sendFile(path.join(__dirname, '/transito.html'));
});

//Cerrar sesion
app.get('/logout', (req, res)=>{
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


const port=5000;
app.listen(port, () => {  
  console.log('Servidor iniciado');
});

