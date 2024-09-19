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

class App extends React.Component {
  constructor(props) {
    super(props)
    this.default_page = "InfoPage"//SET THIS PAGE
    this.state = { page: this.default_page, loginOpen: false }
  }

  componentDidMount() {
    // Prevent navigation via href. Change url instead manually and update state.page for conditional rendering.
    //this.setState({page: window.location.href});
    let page = new URL(window.location.href).pathname.slice(1)
    if (page == "") page = this.default_page;
    this.setState({ page: page });

    window.block_navigation = true;
    //window.navigation.addEventListener("navigate", (event) => {
    window.addEventListener("popstate1", (event) => {
        alert("popstate")

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

  mobile_version1(){
    return <>
    <div className="container">
    <div className="Header"></div>
    <div className="Content"></div>
    <div className="Menu1" style={{ background: "green", border: "2px solid white" }}>
    </div>
    </div>
    </>
  }
  
  mobile_version(){
    return <>
    <div className="container">
    <div className="Header"></div>
    <div className="Content">
      {this.state.page === "InfoPage" ? (<InfoPage />) : (<></>)}
    </div>
    <div className="UserIcon" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/*<a href="/InfoPage"><img src={user} style={{ width: "75px", height: "75px" }} alt="" /></a>*/}
      <LoginImage userIcon={user} loginOpen={this.state.loginOpen} setLoginOpen={(x)=>this.setState({loginOpen: x})}/>
    </div>
    <div className="AppIcon" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <a href="/InfoPage"><img src={coworking} style={{ width: "75px", height: "75px" }} alt="" /></a>
    </div>
    <div className="AppIconLarge" style={{ color: "white", fontsize: "40", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div>coworkingfriendly.com</div></div>
      <div className="Footer" onClick={()=>this.setState({ loginOpen: true })}>
      </div>
    <div className="Menu1" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{textAlign:"center"}}>
        <a href="/InfoPage"><img src={map} style={{ width: "40px", height: "40px" }} alt="" /></a>
        <div style={{color:"white", fontSize: "12px"}}>Map</div>
      </div>
    </div>
    <div className="Menu2" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{textAlign:"center"}}>
        <a href="/InfoPage"><img src={list} style={{ width: "40px", height: "40px" }} alt="" /></a>
        <div style={{color:"white", fontSize: "12px"}}>List</div>
      </div>
    </div>
    <div className="Menu3" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{textAlign:"center"}}>
        <a href="/InfoPage"><img src={plus} style={{ width: "40px", height: "40px" }} alt="" /></a>
        <div style={{color:"white", fontSize: "12px"}}>Add</div>
      </div>
    </div>
    <div className="Menu4" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{textAlign:"center"}}>
        <a href="/InfoPage"><img src={star} style={{ width: "40px", height: "40px" }} alt="" /></a>
        <div style={{color:"white", fontSize: "12px"}}>Recommended</div>
      </div>
    </div>
    <div className="Menu5" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{textAlign:"center"}}>
        <a href="/InfoPage"><img src={search} style={{ width: "40px", height: "40px" }} alt="" /></a>
        <div style={{color:"white", fontSize: "12px"}}>Search</div>
      </div>
    </div>
  </div>
  </>
  }

  desktop_version(){
    return <div className="centered-div">{this.mobile_version()}</div>
    }

  render(){
    return <><div>Hello World<a href="/LandingPage">Link</a></div></>
  }

  render1() {
    if(window.mobile)return <div className="mobile-div">{this.mobile_version()}</div>;
    else return this.desktop_version();
  }
}

export default App;
