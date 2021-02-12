import React, { useState } from 'react';
import axios from 'axios';

export default () => {
  const [post, setPost] = useState(false);

  const handlePost = () => {
    const formData = new FormData();
    formData.append('post', post[0]);
    return axios.post("http://localhost:5913/api/post", formData).then(res => {
      alert('성공');
    }).catch(err => {
      alert('실패');
    });
  };

  return (
    <div>
      <input type="file" name="file" onChange={e => {
        console.dir(e.target);
        setPost(e.target.files)
      }}/>
      <button type="button" onClick={() => handlePost()}>뚜샤!</button>
    </div>
  );
};
