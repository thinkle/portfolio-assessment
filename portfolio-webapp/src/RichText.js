import React, {Component} from 'react';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.snow.css';
import './RichText.sass';

// Help from https://codepen.io/alexkrolick/pen/xgyOXQ
/* 
 * Simple editor component that takes placeholder text as a prop 
 */
class Editor extends React.Component {
    constructor (props) {
        super(props)
        this.state = { editorHtml: props.editorHtml||'' }
        this.handleChange = this.handleChange.bind(this)

        this.modules = {
        }
        this.formats = [];
        this.propTypes = {placeholder:'string'}
        this.formats = ['bold','italic','link']
        if (props.barebones) {
            this.toolbar = []
        }
        else if (props.basics) {
            this.toolbar = [
                [],
                ['bold','italic'],
                ['link']
            ]
        }
        else {
            this.toolbar = [
                [],
                ['bold','italic','blockquote'],
                [{list:'ordered'},{list:'bullet'},{indent:'-1'},{indent:'+1'}],
                ['link'],
                [{header:[]}]
            ]
            this.formats = [...this.formats, 'list','bullet','indent']
        }
        if (props.multimedia) {
            this.toolbar.push(['image','video'])
            this.formats = [...this.formats, 'image','video']
        }
        if (!props.barebones) {
            this.toolbar.push(['clean']);
        }
        if (props.headers) {
            this.formats = [...this.formats,'headers']
            this.toolbar[0] = ['h1','h2','h3'];
        }
        console.log('QUILL EDITOR!');
        console.log('We have toolbar: ',this.toolbar);
        console.log('We have formats: ',this.formats);
        
    }
    
    handleChange (html) {
        this.setState({ editorHtml: html });
        this.props.onChange && this.props.onChange(html);
    }
    
    
    render () {
        return (
                <div className='noheader'> {/* Hack to remove stupid headers */}
                <ReactQuill 
            theme="snow"
            onChange={this.handleChange}
            value={this.state.editorHtml}
            modules={Editor.modules}
            formats={Editor.formats}
            id={this.props.id}
            placeholder={this.props.placeholder}
                />
                </div>
        )
    }
}

export default Editor;
