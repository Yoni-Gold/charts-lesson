import './App.css';
import { useState , useEffect } from 'react';
import { LineChart , BarChart , Bar , Cell , Line , CartesianGrid , XAxis , YAxis , Tooltip , Legend } from 'recharts';
import {readRemoteFile} from 'react-papaparse';


function App() {

  const [csvData, setData] = useState([]);
  const [graphData , setGraph] = useState([]);
  const [barData , setBar] = useState([]);

  const [country1 , set1] = useState([]);
  const [country2 , set2] = useState([]);

  useEffect(async () => {
    readRemoteFile('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv', {
      complete: (data) => {
        setData(data.data);
        createData(data.data);
      }
    });   
  } , []);

  function createData(data) {
    let arr = data[0].map((e , i) => {
      if (i > 3)
      {
        return {date: e , country1: null , country2: null}
      }
    });
    setGraph(arr.slice(4));

    arr = data.map(e => {
      if (e[0] === '')
      {
        return {name: e[1] , cases: 0}
      }
      else
      {
        return {name: e[0] + ' , ' + e[1] , cases: 0}
      }
    });
    setBar(arr.slice(1));
  }

  function getCountry(value, set)
  {
    if (value !== 'Province/State,Country/Region')
    {
      let countryName = value.split(',')
      let countryData = csvData.find(e => e[0] == countryName[0] && e[1] == countryName[1]);
      set(countryData);
    }
  }

  function getDate(dateValue)
  {
    if (dateValue !== -1)
    {
      let casesByDate = barData.map((e , i) => {
        e.cases = parseInt(csvData.slice(1)[i][dateValue + 4]);
        return e;
      });
      setBar(casesByDate);
    }
  }

  useEffect(() => {
    let newData = graphData.map((e , i) => {
      e.country1 = parseInt(country1.slice(4)[i]);
      return e;
    });
    setGraph(newData);} , [country1]);
  
  useEffect(() => {
    let newData = graphData.map((e , i) => {
      e.country2 = parseInt(country2.slice(4)[i]);
      return e;
    });
    setGraph(newData);} , [country2]);
  
  function fillter10() 
  {
    let arr = [barData[0]];
    let bool = false;
    for (let i = 1; i < barData.length; i++)
    {
      for (let j = 0; j < arr.length; j++)
      {
        if (arr[j].cases < barData[i].cases)
        {
          arr.splice(j, 0, barData[i]);
          bool = true;
          break;
        }
      }

      if (!bool)
      {
        arr.push(barData[i]);
      }

      bool = false;

      if (arr.length > 10)
      {
        arr.pop();
      }
    }

    return arr;
  }

  const fillteredBarData = fillter10();

  return (
    <div className="App">
      <h1>Cases per Country in the last Year</h1>
      <LineChart width={1000} height={500} data={graphData}>
    <Line name={country1[1]} type="monotone" dataKey="country1" stroke="red" />
    <Line name={country2[1]} type="monotone" dataKey="country2" stroke="blue" />
    <CartesianGrid stroke="#ccc" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
  </LineChart>
  
  <select onChange={(e) => {getCountry(e.target.value , set1)}} style={{border: '1px solid red'}}>
  {csvData.map(e => <option value={`${e[0]},${e[1]}`}>{e[0] !== "" && e[0] + " , "}{e[1]}</option>)}
  </select>
  <select onChange={(e) => {getCountry(e.target.value , set2)}} style={{border: '1px solid blue'}}>
  {csvData.map(e => <option value={`${e[0]},${e[1]}`}>{e[0] !== "" && e[0] + " , "}{e[1]}</option>)}
  </select>

<h1>Cases in the Top 10 Countries by Date</h1>
  <BarChart
        width={1000}
        height={500}
        data={fillteredBarData}
        margin={{top: 50}}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="cases" fill="#8884d8" />
      </BarChart>
      <select onChange={(e) => {getDate(parseInt(e.target.value))}}>
        <option value={-1}>choose date</option>
  {csvData[0] && csvData[0].slice(4).map((e , i) => <option value={i}>{e}</option>)}
  </select>
</div>
  );
}

export default App;
