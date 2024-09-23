import React from "react";
import './Main.css';
import InfoPage from './components/InfoPage.js'
import LoginImage from "./components/LoginImage.js";
import user from './icons/user.svg';
import map from './icons/map.svg';
import search from './icons/search.svg';
import star from './icons/star.svg';
import list from './icons/list.svg';
import plus from './icons/plus.svg';
import coworking from './icons/coworking.png';
import { toHaveDisplayValue } from "@testing-library/jest-dom/matchers.js";

class Main extends React.Component {
    constructor(props) {
      super(props)
      this.default_page = ""//SET THIS PAGE
      this.state = { page: this.default_page, loginOpen: false, loggedIn: false }
      this.loginOrRedirect = this.loginOrRedirect.bind(this);
    }
  
    componentDidMount() {
      // Prevent navigation via href. Change url instead manually and update state.page for conditional rendering.
      //this.setState({page: window.location.href});
      //let page = new URL(window.location.href).pathname.slice(1)
      //if (page == "") page = this.default_page;
      //this.setState({ page: this.default_page });
  
      window.block_navigation = true;
      //window.navigation.addEventListener("navigate", (event) => {
      if (window.navigation){
        window.addEventListener("popstate", (event) => {
            //alert("popstate")
    
            if (window.block_navigation) {
            event.preventDefault();
            let new_slug = new URL(event.destination.url).pathname;
            window.block_navigation = false;
            window.history.pushState('', document.title, new_slug);
            window.block_navigation = true;
            this.setState({ page: new_slug.slice(1) })
            };
        });
        }
    }

    loginOrRedirect(e){
        if(!this.state.loggedIn){
            e.preventDefault();
            this.setState({ loginOpen: true});
        };
    }
  
    mobile_version() {
        return (
          <div className="container">
            <div className="Header"></div>
            <div className="Content">
              {this.state.page === "" ? <InfoPage /> : <></>}
            </div>
            <div className="UserIcon">
              <LoginImage
                userIcon={user}
                loginOpen={this.state.loginOpen}
                setLoginOpen={(x) => this.setState({ loginOpen: x })}
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
                <a href="/">
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
                <a href="/">
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
        return <div className="centered-div">{this.mobile_version()}</div>
        }
    
      render() {
        if(window.mobile)return <div className="mobile-div">{this.mobile_version()}</div>;
        else return this.desktop_version();
      }
}

export default Main;