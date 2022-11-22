import React from "react";
import ReactDOM from "react-dom";
import { compose, withProps } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker
} from "react-google-maps";

// referenced from https://collegescorecard.ed.gov/data/documentation/
const CollegeEndpoint = "https://api.data.gov/ed/collegescorecard/v1/";
const CollegeAPIKey = process.env.REACT_APP_College_API_Key;

const GoogleMapEndponit = "https://maps.googleapis.com/maps/api/";
const GoogleMapAPIKey = process.env.REACT_APP_Google_Map_API_Key;

const fields = "id,school.name,location.lat,location.lon"; // fields name list

// referenced from https://tomchentw.github.io/react-google-maps
const MyMapComponent = compose(
  withProps({
    googleMapURL: `${GoogleMapEndponit}js?key=${GoogleMapAPIKey}&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: <div style={{ height: `100%` }} />,
    containerElement: <div style={{ height: `400px` }} />,
    mapElement: <div style={{ height: `100%` }} />
  }),
  withScriptjs,
  withGoogleMap
)((props) => (
  // defaultCenter referecend from https://gps-coordinates.org/united-states-latitude.php
  <GoogleMap
    defaultZoom={4}
    defaultCenter={{ lat: 41.850033, lng: -87.6500523 }}
  >
    {props.isMarkerShown && props.marks && props.marks.length
      ? props.marks.map((mark, index) => (
          <Marker
            key={index}
            title={mark["school.name"]}
            position={{ lat: mark["location.lat"], lng: mark["location.lon"] }}
          />
        ))
      : "College data not found!"}
  </GoogleMap>
));

class App extends React.Component {
  state = {
    marks: [],
    keyword: "",
    perPage: 20 // default count is 20, limit is 100
  };

  handleSearch = (event) => {
    event.preventDefault();
    this.fetchMarks();
  };

  handleChange = (event) => {
    this.setState({
      keyword: event.target.value
    });
  };

  handlePerPage = (event) => {
    const number = event.target.value;

    if (number && number > 0 && number < 101) {
      this.setState({
        perPage: event.target.value
      });
    }
  };

  fetchMarks = () => {
    try {
      fetch(
        `${CollegeEndpoint}schools?api_key=${CollegeAPIKey}&school.name=${this.state.keyword}&fields=${fields}&per_page=${this.state.perPage}`
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          this.setState({
            marks: res.results
          });
        });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSearch}>
          <p>
            <label>Keyword: </label>
            <input
              type="text"
              value={this.state.keyword}
              onChange={this.handleChange}
            />
          </p>
          <p>
            <label>Marker Count Limit: </label>
            <input
              type="number"
              value={this.state.perPage}
              onChange={this.handlePerPage}
            />
          </p>
          <p>
            <button type="submit">Search</button>
          </p>
        </form>
        <MyMapComponent
          isMarkerShown={true}
          marks={this.state.marks}
          onMarkerClick={this.handleMarkerClick}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
