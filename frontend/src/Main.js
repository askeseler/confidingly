import React from "react";
import './Main.css';
import InfoPage from './components/InfoPage.js'
import Registration from './components/Registration.js'
import MapPage from './components/MapPage.js'
import FormPage from './components/FormPage.js'

import Login from "./components/Login.js";
import user from './icons/user.svg';
import map from './icons/map.svg';
import search from './icons/search.svg';
import star from './icons/star.svg';
import list from './icons/list.svg';
import plus from './icons/plus.svg';
import coworking from './icons/coworking.png';

let DEBUG = true;

class Main extends React.Component {
    constructor(props) {
      super(props)
      this.default_page = ""//SET THIS PAGE
      this.state = { page: this.default_page, loginOpen: false, loggedIn: false }
      this.loginOrRedirect = this.loginOrRedirect.bind(this);

      if(DEBUG)this.setLoggedIn(true);
    }
  
    componentDidMount() {
      // Prevent navigation via href. Change url instead manually and update state.page for conditional rendering.
      //this.setState({page: window.location.href});
      let page = new URL(window.location.href).pathname.slice(1)
      if (page == "") page = this.default_page;
      this.setState({ page: page });
  
      window.block_navigation = true;
      
      if (window.navigation){
        window.navigation.addEventListener("navigate", (event) => {  
          if (window.block_navigation) {
            event.preventDefault();
            let new_slug = new URL(event.destination.url).pathname;
            window.block_navigation = false;
            window.history.pushState('', document.title, new_slug);
            window.block_navigation = true;
            this.setState({ page: new_slug.slice(1) })
          };
        });
      }else{
        window.addEventListener("popstate", (event) => {  
          if (window.block_navigation) {
            let new_slug = new URL(event.destination.url).pathname;
            window.block_navigation = false;
            window.history.pushState('', document.title, new_slug);
            window.block_navigation = true;
            this.setState({ page: new_slug.slice(1) })
          };
        });
        if(false){
        document.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = e.currentTarget.getAttribute('href').slice(1);
            if (targetPage) {
                window.history.pushState({}, "", `/${targetPage}`); // Update the browser URL
                this.setState({ page: targetPage });
                this.forceUpdate();
            }
        });
        });};
    }
    }

    setLoggedIn(isLoggedIn, hoursUntilExpiration = 48) {
      const expirationTime = Date.now() + hoursUntilExpiration * 60 * 60 * 1000; // Convert hours to milliseconds
      localStorage.setItem('isLoggedIn', isLoggedIn);
      localStorage.setItem('expirationTime', expirationTime); // Store expiration time
    }
  
    // Check if user is logged in and if the session has expired
    loggedIn() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const expirationTime = localStorage.getItem('expirationTime');
  
      if (!isLoggedIn || !expirationTime) {
        return false; // Not logged in or no expiration time
      }
  
      // Check if the current time is past the expiration time
      const currentTime = Date.now();
      return currentTime < expirationTime; // Returns true if still logged in
    }

    loginOrRedirect(e){
        if(!this.loggedIn()){
            e.preventDefault();
            this.setState({ loginOpen: true});
        };
    }
  
    mobile_version() {
        return (
          <div className="container">
            <div className="Header"></div>
            <div className="Content">
              {this.state.page === "" ? <InfoPage /> : <div/>}
              {this.state.page === "registration" ? <Registration /> : <div/>}
              {this.state.page === "map" ? <MapPage /> : <div/>}
              {this.state.page === "form" ? <FormPage /> : <div/>}
            </div>
            <div className="UserIcon">
              <Login
                userIcon={user}
                loginOpen={this.state.loginOpen}
                setLoginOpen={(x) => this.setState({ loginOpen: x })}
                setLoggedIn={this.setLoggedIn}
              />
            </div>
            <div className="AppIcon">
              <a href="/">
                <img src={coworking} alt="Coworking Icon" />
              </a>
            </div>
            <div className="AppIconLarge">
              <div>coworkingfriendly.com</div>
            </div>
            <div className="Menu1">
              <div onClick={this.loginOrRedirect}>
                <a href="/map">
                  <img src={map} alt="Map Icon" />
                </a>
                <div>Map</div>
              </div>
            </div>
            <div className="Menu2">
              <div onClick={this.loginOrRedirect}>
                <a href="/">
                  <img src={list} alt="List Icon" />
                </a>
                <div>List</div>
              </div>
            </div>
            <div className="Menu3">
              <div onClick={this.loginOrRedirect}>
                <a href="/form">
                  <img src={plus} alt="Add Icon" />
                </a>
                <div>Add</div>
              </div>
            </div>
            <div className="Menu4">
              <div onClick={this.loginOrRedirect}>
                <a href="/">
                  <img src={star} alt="Recommended Icon" />
                </a>
                <div>Recommended</div>
              </div>
            </div>
            <div className="Menu5">
              <div onClick={this.loginOrRedirect}>
                <a href="/">
                  <img src={search} alt="Search Icon" />
                </a>
                <div>Search</div>
              </div>
            </div>
          </div>
        );
      }
      
      desktop_version(){
        document.clientWidth = document.documentElement.clientWidth * 0.3;

        return <div className="centered-div">{this.mobile_version()}</div>
        }
    
      render() {
        if(window.mobile){
          document.clientWidth = document.documentElement.clientWidth;
          document.clientHeight = document.documentElement.clientHeight;
          return <div className="mobile-div">{this.mobile_version()}</div>}
        else{
          document.clientWidth = document.documentElement.clientWidth * .3;
          document.clientHeight = document.documentElement.clientHeight;
          return this.desktop_version();
        }
      }
}

export default Main;