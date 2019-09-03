import React, {Component} from 'react';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.core.css';
import 'react-quill/dist/quill.snow.css';


// Help from https://codepen.io/alexkrolick/pen/xgyOXQ
/* 
 * Simple editor component that takes placeholder text as a prop 
 */
class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.state = { editorHtml: props.editorHtml||'' }
    this.handleChange = this.handleChange.bind(this)
  }
  
  handleChange (html) {
      this.setState({ editorHtml: html });
      this.props.onChange && this.props.onChange(html);
  }
  
  
  render () {
    return (
      <div>
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

/* 
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
Editor.modules = {
  toolbar: [
      [{ 'header': '1'}, {'header': '2'}, ],
      //[{size: []}],
      ['bold', 'italic','blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
  ],
    clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
    }
}
/* 
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
  'header', 
  'bold', 'italic', 'underline', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video'
]

/* 
 * PropType validation
 */
Editor.propTypes = {
  placeholder: 'string',
}

export default Editor;
