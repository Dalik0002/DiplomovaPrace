/*
class Clock extends React
    .Component {
    constructor(props) {
        super(props);
        this.state = {
            time: new Date().toLocaleString()
        };
    }
    componentDidMount() {
        this.intervalID = setInterval(() => this.tick(), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.intervalID);
    }
    tick() {
        this.setState({ // Automatically call render after state change
            time: new Date().toLocaleString()
        });
    }
    render() {
        return (this.state.time);
    }
}
export default Clock
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';

function Clock() {
  const [currentDateTime, setCurrentDateTime] = useState(moment());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(moment());
    }, 1000); // Aktualizovat každou sekundu

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div>
      <div>Aktuální čas: {currentDateTime.format('HH:mm:ss')}</div>
      <div>Aktuální datum: {currentDateTime.format('DD.MM.YYYY')}</div>
      <div>Dnes je: {currentDateTime.format('dddd')}</div>
    </div>
  );
}

export default Clock;