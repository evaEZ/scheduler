import { useState, useEffect } from "react";

const axios = require('axios').default;

const getSpotsForDay = (day, appointments) => day.appointments.length - day.appointments
  .reduce((count, id) => (appointments[id].interview ? count + 1 : count), 0);

export default function useApplicationData(initial) {
  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => setState({ ...state, day });
  
  useEffect(()=> {Promise.all([
    axios.get("/api/days"),
    axios.get("/api/appointments"),
    axios.get("api/interviewers")
    ]).then((all) => {
      setState(prev => ({...prev, days: all[0].data, appointments: all[1].data, interviewers: all[2].data})); 
    });
  },[]);

  function bookInterview(id, interview) {
  
  const appointment = {
    ...state.appointments[id],
    interview
  };
  
  const appointments = {
    ...state.appointments,
    [id]: appointment
  };

  const days = state.days.map(day => { 
    return day.appointments.includes(id)
    ? {...day, spots: getSpotsForDay(day, appointments)}
    : day;     
  });
  
  return axios.put("/api/appointments/"+id, appointment)
    .then((res) => {
      const resObj=JSON.parse(res.config.data);
      const interview = resObj.interview;
    setState({
      ...state,
      days,
      appointments
    });
  }); 
}

function cancelInterview(id) {
  const appointment = {
    ...state.appointments[id],
    interview: null
  };
  const appointments = {
    ...state.appointments,
    [id]: appointment
  };
  
  const days = state.days.map(day => { 
    return day.appointments.includes(id)
    ? {...day, spots: getSpotsForDay(day, appointments)}
    : day;     
  });
  
  return axios.delete("/api/appointments/"+id,appointment)
  .then(() => {
    setState({
      ...state,
      days,
      appointments
    });
  });
  
}

  return { state, setDay, bookInterview,cancelInterview };
}
