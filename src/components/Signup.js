import React,{useState} from 'react';
import { useNavigate } from "react-router-dom";

const Signup = (props) => {
    const [credentials,setCredentials] = useState({name: "",email: "",password: "",cpassword: ""});

    let navigate = useNavigate();//hook used to navigate 

    const handleSubmit = async (event)=>{
        event.preventDefault();
        const response = await fetch("http://localhost:5000/api/auth/createuser", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({name: credentials.name, email: credentials.email,password: credentials.password})
          });
        
          const json = await response.json();
          console.log(json);
          if(json.success) {
              localStorage.setItem('token',json.authToken);
              props.showAlert("Account Created Successfully!","success");
              navigate("/");
          } else {
              props.showAlert("Invalid Credentials","danger");
          }
    }

    const handleChange= (event)=>{
        setCredentials({...credentials, [event.target.name]: event.target.value})
    }

    return (
        <div className="container mt-2">
        <h1 className='my-2'>Register to Jotter</h1>
            <form onSubmit={handleSubmit}>
                <div className="my-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" onChange={handleChange} id="name" name= "name" value={credentials.name} required/>
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" onChange={handleChange} id="email" name= "email" aria-describedby="emailHelp" value={credentials.email} required/>

                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>

                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" onChange={handleChange} id="password" name="password" value={credentials.password} required minLength={5}/>
                </div>

                <div className="mb-3">
                    <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" onChange={handleChange} id="cpassword" name="cpassword" value={credentials.cpassword} required minLength={5}/>
                </div>

                <button type="submit" className="btn btn-primary" onSubmit={handleSubmit}>Submit</button>
            </form>
        </div>
    )
}

export default Signup
