import React, { Component } from 'react';
import { Link } from 'react-router';
import { hashHistory } from 'react-router';
import {FlatButton} from 'material-ui';
import _ from 'lodash';
import axios from 'axios';
import './users.css';

import config from '../../../config';
const api = config.api || '';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state={
        email: this.props.params.userId,
        first_name:'',
        last_name: '',
        user_name: '',
        location: '',
        me: false,
      badges: [],
        facebook_url: '',
        twitter_url:'',
        linkedIn_url:'',
        github_url:'',
        github_username:''
    }
  }

  getUserData(){
    var scope = this;

    if (this.state.email === this.props.auth.getProfile().email){
      axios.get(api+'/api/users/me',{headers:{Authorization: 'Bearer '+this.props.auth.getToken()}})
      .then(function(res){
        let data=res.data;
        scope.setState({
        me: true,
        first_name:data.first_name,
        last_name: data.last_name,
        user_name: data.user_name,
        location: data.location,
          badges:data.points.awards || [],
          facebook_url: data.facebook_url,
          twitter_url: data.twitter_url,
          github_url: data.github_url,
          github_username: data.github_username,
          linkedIn_url: data.linkedIn_url
        });
      })
    } else {
      axios.get(api+'/api/users/'+this.state.email)
      .then(function(res){
        let data = res.data;
        scope.setState({
          first_name:data.first_name,
          last_name: data.last_name,
          user_name: data.user_name,
          location: data.location,
          badges: data.points.awards || [],
          facebook_url: data.facebook_url,
          twitter_url: data.twitter_url,
          github_url: data.github_url,
          github_username: data.github_username,
          linkedIn_url: data.linkedIn_url
        });
      })
    }
  }

  componentWillMount(){
    this.getUserData()
  } 

  render(){
    var button;
    if (this.state.me) {
      button = <Link className='link' to="/editprofile" ><FlatButton className='button'>Edit your profile</FlatButton></Link>
    }


    var profileTitle;
    if (this.state.me){
      profileTitle = "Your profile"
    } else {
      profileTitle = <span>{this.state.email }'s profile</span>
    }

    var badges;
    if(this.state.badges.length>0){
      badges = this.state.badges.map((badge)=><img key={badge.name+badge.count} src={"/badges/"+badge.name.toLowerCase()+'-'+badge.count+'.png'} width="250"/>)
    }


  	return(
  	<div className="profile-section">
      <FlatButton className='link button inline-blk' onClick={hashHistory.goBack}>Back</FlatButton>
      <br/>
      <div className='profile-container'>
        <h1>{profileTitle} </h1> 

        User Name:  {this.state.user_name } <br/>
        First Name:  {this.state.first_name} <br/>
        Last Name:  {this.state.last_name} <br/>
        Location:  {this.state.location}<br/>
        Github Username: {this.state.github_username}
        <br/>
        {this.state.facebook_url ? <a href={this.state.facebook_url}><i className="fa fa-facebook fa-2x" /></a> : null}
        {this.state.github_url ? <a href={this.state.github_url}><i className="fa fa-github fa-2x" /></a> : null}
        {this.state.twitter_url ? <a href={this.state.twitter_url}><i className="fa fa-twitter fa-2x" /></a> : null}
        {this.state.linkedIn_url ? <a href={this.state.linkedIn_url}><i className="fa fa-linkedin fa-2x" /></a> : null}
        <br />
        {badges}

        {}

        {button}
      </div>
  	</div>
  	)
  }
}

