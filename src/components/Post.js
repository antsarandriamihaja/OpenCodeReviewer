import React, { Component } from 'react';
import HTTP from '../services/httpservice';

import PostComment from './PostComment';

import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';


export default class Post extends Component {
  constructor(props) {
    super(props);
    this.state = { 
    	id: this.props.params.postId
    }
  }

  getPostData(){
  	var scope = this;
  	var data = HTTP.get('/documents/'+this.state.id)
    .then(function(data){
        scope.setState({
          id: data._id,
          title:data.title,
          author:data.author,
          text: data.text,
          tags: data.tags,
          date_submited:data.date_submitted,
          comments:data.comments
        })
      })
  }

  componentWillMount(){
    this.getPostData()
    } 


   handleSubmit(){
   		this.getPostData();
    }
    
  render() {
  	var displayedComment='';
  	var commentsList = []
  	var existingComments = this.state.comments;
  	if (existingComments ){
  		if(existingComments.length==0){
  			displayedComment = '';
  		} else if (existingComments.length>0){
  			existingComments.forEach(function(comment){  				
  				commentsList.push(comment.text)
  			})
  			displayedComment = <p>Comment:{commentsList.join(', ')}</p>
  		}
  	}

    var options = {
      lineNumbers: true,
      mode: 'javascript',
      matchBrackets: true,
      closebrackets: true

    }
  	
    return (
      <div>
        <h2>Title: {this.state.title}</h2>
        <p>Tags: {this.state.tags}</p>
        <p>Text: <CodeMirror value={this.state.text} options={options} /></p>
        {displayedComment}
   		
        <p> Posted on: {this.state.date_submited} by {this.state.author} </p>
        <form onSubmit = {this.handleSubmit.bind(this)}>
        	<PostComment id={this.state.id}></PostComment>
        </form>
      </div>

    )
  }

}