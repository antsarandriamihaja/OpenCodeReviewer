import React, { Component } from 'react';
import HTTP from '../services/httpservice';
import  ReactSelectize from "react-selectize";
var MultiSelect = ReactSelectize.MultiSelect;
var SimpleSelect =  ReactSelectize.SimpleSelect;

import Code from './Code.js';
import 'react-selectize/dist/index.css';
import taglist from '../../tag-list';


export default class NewPost extends Component {


  constructor() {
    super();

    this.state = { 
    	title: '',
      tags: [],
      description:"",
      submit: false,
      text: 'initial'
    }
  }

  getState(){

    var data = this.state;
    delete data.submit;
    return data;
  }

 static contextTypes= {
    router: React.PropTypes.object.isRequired
  }

  handleChange (input, e) {
    var change = {};
    change[input] = e.target.value;
    this.setState(change);
  }

  saveCode(data){
    this.setState({
      submit:false,
      text: data
    })
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({submit:true});

    
  window.setTimeout(function () {

    var data = this.getState();
   
   HTTP.post('/documents', data);
    }.bind(this), 10); 

  window.setTimeout(function () {  
      this.context.router.push('/dashboard');
    }.bind(this), 600);   
  }


  render() {

    var self = this;
    var options = taglist.map(function(tag){
        return {label: tag, value: tag}
    });


    return (
     
      <div >
      

      <div className='new-post-form form-container'>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className='form-item'>
          <label> Title: </label>
          <input type="text" name="title" value={this.state.title} 
                             onChange={this.handleChange.bind(this, 'title')}>
          </input>        
       </div>
       <div className='form-item clearfix'>
          <label> Description: </label>
          <textarea type="text" name="description" value={this.state.description} 
                             onChange={this.handleChange.bind(this, 'description')}>
          </textarea>
        </div>

        <div className='form-item clearfix'>

          <label> Tags: </label>
          <MultiSelect ref="select" options = {options} maxValues={5} placeholder = "Select tag"
            value = {this.state.tags}
           createFromSearch = {function(options, values, search){
                var labels = values.map(function(value){ 
                    return value.label; 
                })
                if (search.trim().length == 0 || labels.indexOf(search.trim()) != -1) 
                    return null;
                return {label: search.trim(), value: search.trim()};
            }} 
            onValuesChange={function(value){
              var tags = [];
              value.map(function(item){
                tags.push(item.value);
              });
              self.setState({tags:tags});             
            }}
          ></MultiSelect>
          </div>

          <Code saveCode={this.saveCode.bind(this)} submit = {this.state.submit} > </Code>
          <button className="button-darkgreen" type="submit" value="Submit your code" >Submit your code</button>
      </form>
      </div>
     </div>
    )
  }

}