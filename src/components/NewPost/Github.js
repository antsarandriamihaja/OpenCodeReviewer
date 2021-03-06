import React, { Component } from 'react';
import Code from './Code';
import  ReactSelectize from "react-selectize";
import axios from 'axios';
import getGithubRepo from './Github-repo';
import GithubFile from './GithubFile';

import config from '../../../config';
const api=config.api || '';
var SimpleSelect=ReactSelectize.SimpleSelect;
import {FlatButton} from 'material-ui';

export default class Github extends Component {
  constructor(props) {
    super(props);
    this.state={
      stage1:false,
      stage2:false,
      stage3:false,
      stage4:false,
      getWholeRepo:false,
      user_name:'',
      selectedRepo:'',
      repos:[],
      branches:[], // not used right now
      files:[],
      fileContent:'',
      backToTopButton: false,
      path:'defaultList',
      error:''

    }
  }

  static contextTypes= {
    router: React.PropTypes.object.isRequired
  }

  // for the username input only
  handleChange (e) {
    this.setState({user_name:e.target.value, stage1:true});
  }

  submitUserName(e){
    e.preventDefault();
    this.setState({stage1:true});
    this.getRepos()
  }

  componentWillMount(){
    // this can stay if we want to pass in the github username as a props. Right now it does nothing.
    this.getRepos()
    axios.get(api+'/api/users/me',{headers:{Authorization: 'Bearer '+this.props.auth.getToken()}})
      .then((res)=>{
        if(res.data.github_username) {
          this.setState({user_name: res.data.github_username});
        }
      })
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.name.length>0){
      this.setState({error:''})
    }
  }

  // get repos from user name entered (or the username could also be passed down as props
  // if the user has it set in his user info)
  getRepos(){
    var scope = this;
    this.props.removeSubmitButton()
    if(this.state.user_name) {
      axios.get('https://api.github.com/users/' + this.state.user_name + '/repos')
        .then((res)=> {
        scope.setState({repos: res.data, selectedRepo:'', files:[], fileContent:'', stage3:false, stage4:false})
      })
    }
  }

  // not used right now - only getting files from master for now
  getBranches(repo){
    this.setState({stage2:true});
    var scope = this;
    if(this.state.repos) {
      axios.get('https://api.github.com/repos/'+this.state.user_name + '/'+ repo+'/branches')
        .then((res)=>{
           scope.setState({branches: res.data})
        })
    }
  }

  // get a list of files and folders from the selected repo (right now, branch is set to 'master' and not used)
  getFiles(branch,repo){
    this.setState({stage3:true});
    axios.get('https://api.github.com/repos/'+this.state.user_name+'/'+repo+'/contents')
      .then((res)=>{
        this.setState({files:res.data, selectedRepo:repo})
      })
  }

  // get the content of a file
  selectFile(path){
    axios.get('https://api.github.com/repos/'+this.state.user_name+'/'+this.state.selectedRepo+'/contents/'+path)
      .then((res)=>{
        this.setState({fileContent:atob(res.data.content), stage4:true})
        this.props.saveCode(atob(res.data.content));
        if(!this.props.importRepo){
          this.props.displaySubmitButton();
        }
      })
  }

  // open a folder
  resolvePath(path){
    axios.get('https://api.github.com/repos/'+this.state.user_name+'/'+this.state.selectedRepo+'/contents'+path)
      .then((res)=>{
        this.setState({files:res.data,backToTopButton:true,path:path})
      })
  }

  getGithubRepo(){
    this.setState({getWholeRepo:true});
  }
  
  submitRepo(){
    if(this.props.name) {
      let newDoc = {
        title: this.props.name,
        description: this.props.description,
        tags: this.props.tags,
        text: '',
        language: 'text',
        multi_files: true
      }
      axios.post(api + '/api/documents', newDoc, {headers: {Authorization: 'Bearer ' + this.props.auth.getToken()}})
        .then((doc)=> {
          //document id passed in twice: once as _parent, once as doc_id. see github-repo.js
          getGithubRepo('https://api.github.com/repos/' + this.state.user_name + '/' + this.state.selectedRepo + '/contents/', doc.data._id, doc.data._id, 'defaultList')
          this.context.router.push('/dashboard')

        })
    } else {
      this.setState({error:'title is required!'})
    }
  }

  backToTop(){
    this.getFiles('master',this.state.selectedRepo);
    this.setState({backToTopButton:false, path:'defaultList'})
  }


  render(){
    var scope=this;
    //commented out because right now I am only able to get files from the master branch
    // let reposList=this.state.repos.map((repo)=><li key={repo.id}><button onClick={this.getBranches.bind(this,repo.name)}>{repo.name}</button></li>)
    //let branchList=this.state.branches.map((branch)=><li key={branch.name}><button onClick={this.getFiles.bind(this,branch.name)}>{branch.name}</button></li>)

 //   let reposList=this.state.repos.map((repo)=><li key={repo.id}><button onClick={this.getFiles.bind(this,'master',repo.name)}>{repo.name}</button></li>)
    var repoList = this.state.repos.map(function(repo){
        return {label: repo.name, value: repo.name}
    });

    let branchList='';

    let fileList=this.state.files.map((file)=>{
      return <GithubFile file={file}
                         resolvePath={this.resolvePath.bind(this)}
                         selectFile={this.selectFile.bind(this)}
                         importRepo={this.props.importRepo}
                         path={this.state.path}
      />
    })
    
    return(
      <div className='github-container'>
      <div className='mrgBtm20 mrgTop20'> Import code from a GitHub Repository </div>
        <div className="row">
        <form className='github'>
          <div className="col-md-6">
            <input type="text"
                   name="user_name"
                   placeholder="github username"
                   value={this.state.user_name}
                   onChange={this.handleChange.bind(this)} />
            </div>
          <div className="col-md-3">
            <FlatButton className='button'
                    type="submit"
                    onClick={this.submitUserName.bind(this)}>
              Ok
            </FlatButton>
            </div>
        </form>
          </div>


      {this.state.stage1 ? 
        <div className='row'>
          <div className='col-md-6'>
            <div>repository:</div>
            <SimpleSelect className='full-width' 
                          ref="simpleselect"
                          placeholder="repository"
                          options={repoList}
                          value={{'label':this.state.selectedRepo, 'value':this.state.selectedRepo}}
                          onValueChange={function(value){
                            scope.setState({selectedRepo: value.value});
            }}/>
           </div> 
          <div className='col-md-1'>
            <FlatButton className='button inline-blk'
                        id="github1-ok"
                        type="submit"
                        onClick={this.getFiles.bind(this,'master', this.state.selectedRepo)}>
              OK</FlatButton>
          </div>
        </div>
      : null}

        {/*stage 2 is not used right now.*/}
        {this.state.stage2 ? <ul>{branchList}</ul> : null}

        {this.state.stage3 ? 
        <div>

          {this.props.importRepo ?
            <div className="warning">Warning: the number of files and folders cannot exceed 30.
              If it does, some files or folders will be missing. Check off any files or folders that you do not need.
            </div> : null
          }
          <div className="file-list-section">
            <div>{fileList}</div>
            {this.state.backToTopButton ?
            <FlatButton onClick={this.backToTop.bind(this)}>Back to top</FlatButton>
            :null}
          </div>

        {this.state.stage4 ?
        <Code saveCode={this.props.saveCode}
              setLanguage={this.props.setLanguage}
              code={this.state.fileContent} /> : null}
        </div> : null}
        {this.props.importRepo && this.state.stage3 ?
          <div>
            <FlatButton className='button'
                        onClick={this.submitRepo.bind(this)}>Submit repository
            </FlatButton>
            <div style={{color:'red'}}>{this.state.error}</div>
          </div>
          : null }
        </div>
    )
  }
}


