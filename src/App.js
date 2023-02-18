import React, { Component } from 'react';
//import logo from './logo.svg';
import { Badge } from 'react-bootstrap';
import { Spin, Button, Select, notification } from 'antd';
import axios from 'axios';
import './App.css';
import moment from 'moment';
const Option = Select.Option;
const ButtonGroup = Button.Group;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      busStop: '10161',
      busSchedule: [],
      loading: false,
      allBusStops: [],
      lastUpdateTime: '',
      favouriteBusStops: this.retrieveArrayFromLocalStorage('favouriteBusStops')
    };
    this.onSelectBusStop = this.onSelectBusStop.bind(this);
    this.getBusTiming = this.getBusTiming.bind(this);
    this.refreshBusTiming = this.refreshBusTiming.bind(this);
    this.getAllBusStops = this.getAllBusStops.bind(this);
    this.addToFavouriteBusStops = this.addToFavouriteBusStops.bind(this);
    this.retrieveArrayFromLocalStorage = this.retrieveArrayFromLocalStorage.bind(this);
    this.updateStringToLocalStorage = this.updateStringToLocalStorage.bind(this);
    this.removeFromFavouriteBusStops = this.removeFromFavouriteBusStops.bind(this);
    this.removeStringFromLocalStorage = this.removeStringFromLocalStorage.bind(this);
  }

  componentWillMount() {
    let self = this;
    this.getAllBusStops();
    if (this.state.busStop !== '') {
      self.refreshBusTiming()
    }
    //localStorage.setItem('favouriteBusStops', '');
    console.log(this.state.favouriteBusStops);
  }

  componentDidMount() {
    let self = this;
    if (this.state.busStop !== '') {
      let timer = setInterval(function () {
        self.refreshBusTiming();
      }, 60000);
    }
  }

  onSelectBusStop(eventKey) {
    this.setState({ busStop: eventKey }, () => {
      this.getBusTiming(this.state.busStop);
    })

  }

  refreshBusTiming() {
    this.getBusTiming(this.state.busStop);
  }

  getBusTiming(busStop) {
    let self = this;
    self.setState({ 'loading': true })
    axios.get(`/getBusSchedule?busStopCode=${busStop}`)
      .then(function (result) {
        self.setState({ 'loading': false, 'lastUpdateTime': moment().format('h:mm:ss') });
        //console.log(result);
        self.setState({
          busStop: `${busStop}`,
          busSchedule: result.data.Services.map(function (item) {
            return { "BusNumber": item.ServiceNo, "NextBusTiming": item.NextBus.EstimatedArrival };
          }).sort(function (a, b) { return new Date(a.NextBusTiming) - new Date(b.NextBusTiming) })
        });
      });
  }

  getAllBusStops() {
    let self = this;
    self.setState({ 'onLoading': true })
    axios.get(`/getAllBusStops`)
      .then(function (result) {
        self.setState({ 'onLoading': false });
        console.log(result);
        self.setState({ allBusStops: result.data.value });
      });
  }

  addToFavouriteBusStops() {
    this.updateStringToLocalStorage('favouriteBusStops', this.state.busStop);
    this.setState({ favouriteBusStops: this.retrieveArrayFromLocalStorage('favouriteBusStops') });
    notification['success']({
      message: 'Added to favourites',
      description: this.state.busStop,
    });
  }

  removeFromFavouriteBusStops() {
    this.removeStringFromLocalStorage('favouriteBusStops', this.state.busStop);
    this.setState({ favouriteBusStops: this.retrieveArrayFromLocalStorage('favouriteBusStops') });
    notification['success']({
      message: 'Removed from favourites',
      description: this.state.busStop,
    });
  }

  retrieveArrayFromLocalStorage(itemName) {
    let favouriteBusStopStr = localStorage.getItem(itemName);
    if (!favouriteBusStopStr) {
      return [];
    }
    return localStorage.getItem(itemName).split(',')
  }

  updateStringToLocalStorage(itemName, busStop) {
    let favouriteBusStopStr = localStorage.getItem(itemName);
    if(favouriteBusStopStr===null) favouriteBusStopStr= '';
    if (favouriteBusStopStr.search(busStop) === -1) {
      if (favouriteBusStopStr) {
        localStorage.setItem(itemName, favouriteBusStopStr + ',' + busStop);
      } else {
        localStorage.setItem(itemName, busStop);
      }
    }
  }

  removeStringFromLocalStorage(itemName, busStop) {
    let favouriteBusStopsArr = this.retrieveArrayFromLocalStorage(itemName);
    if (favouriteBusStopsArr.indexOf(busStop) >= 0) {
      let index = favouriteBusStopsArr.indexOf(busStop)
      favouriteBusStopsArr.splice(index, 1);
      let favouriteBusStopsStr = favouriteBusStopsArr.reduce((finalStr, busStop, index) => {
        if (index === 0) {
          return busStop;
        } else {
          return finalStr + ',' + busStop;
        }
      }, '');
      localStorage.setItem(itemName, favouriteBusStopsStr);
    }
  }



  render() {
    console.log(localStorage.getItem('favouriteBusStops'));
    return (
      <div>
        <div className="App-header">Bus App</div>
        <div className="searchPanel" style={{ margin: "20px", textAlign: 'center' }}>
          <p style={{ margin: "20px", color: "black", display: 'inline-block' }}> Select bus stop: </p>
          <Select
            showSearch
            style={{ width: 250 }}
            placeholder="Select a bus stop"
            optionFilterProp="children"
            onChange={this.onSelectBusStop}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            disabled={this.state.loading}
            value={this.state.busStop}
          >
            {this.state.allBusStops.map((busStop, index) =>
              (<Option value={busStop.BusStopCode} key={index}>{`${busStop.BusStopCode}: ${busStop.Description}`}</Option>)
            )}
          </Select>
          <Button style={{ marginLeft: '1%' }} onClick={this.refreshBusTiming} icon='sync' type="primary" disabled={!this.state.busStop}></Button>
          <Button style={{ marginLeft: '1%' }} onClick={this.addToFavouriteBusStops} icon='heart' type="primary" disabled={!this.state.busStop}></Button>
          <Button style={{ marginLeft: '1%' }} onClick={this.removeFromFavouriteBusStops} icon='minus-circle' type="primary" disabled={!this.state.busStop}></Button>
          <ButtonGroup className='favouriteBusStopMarks' style={{ display: 'block', fontSize: '14px', margin: '1%' }}>
            {this.state.favouriteBusStops.length > 0 && this.state.favouriteBusStops.map((favouriteBusStop, index) =>
              (<Button key={'favourite' + index} value={favouriteBusStop} onClick={(e) => this.onSelectBusStop(e.target.value)} >{favouriteBusStop}</Button>)
            )}
          </ButtonGroup>
          <div className="spinner" style={{
            zIndex: 200, position: 'absolute', width: '100%', height: '100%',
            textAlign: 'center'
          }}>
            <div style={{ height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}><Spin style={{ color: '#1890FF' }} tip="Refreshing..." spinning={this.state.loading}>
            </Spin></div>
          </div>
          <div className="resultTable" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <table  >
              <tbody>
                <tr>
                  <th>BusNumber</th>
                  <th>NextBusTiming</th>
                </tr>
                {this.state.busSchedule.length !== 0 &&
                  this.state.busSchedule.map((item, i) => (<tr key={i}>
                    <td><Badge style={{ background: '#52C41A' }}>{item.BusNumber}</Badge></td>
                    <td>{moment(item.NextBusTiming).fromNow()}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
          {this.state.lastUpdateTime && <div style={{ color: '#254B7C', fontWeight: 'bold', marginTop: '2%' }}>Last Updated At: {this.state.lastUpdateTime}</div>}
        </div>
      </div>

    );
  }
}

export default App;
