import { useState, useContext } from "react";
import PostContext from "./postContext";
import { HOST } from "../../constants";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import alertContext from "./../alert/alertContext";
import { storage } from "../../utils/firebase";
import loadingBarContext from "../loadingBar/loadingBarContext";
import { ref,  deleteObject } from "firebase/storage";

const PostState = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const contextAlert = useContext(alertContext);
  const { showAlert } = contextAlert;
  const contextLoadingBar = useContext(loadingBarContext);
  const {setProgress} = contextLoadingBar;

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(-1); //to prevent endMessage from showing in InfiniteScroll( emptyArray.size !== -1 )
  const [filter, setFilter] = useState("");

  //set default state
  const resetToDefaultState = () => {
    setPosts([]);
    setPage(1);
    setTotalPosts(-1);
  };

  //get all posts
  const getPosts = async () => {
    const ENDPOINT = `/api/v1/posts?page=${page}&limit=6${filter}`;
    const GET_ALL_POSTS_ENDPOINT = `${HOST}${ENDPOINT}`;
    try {
      const response = await axios.get(GET_ALL_POSTS_ENDPOINT, {
        withCredentials: true,
        credentials: "include",
      });
      let updatedPosts = posts.concat(response.data.data.data);
      let updatedTotalPosts = response.data.totalDocuments;
      setPosts(updatedPosts);
      setPage(page + 1);
      setTotalPosts(updatedTotalPosts);
    } catch (error) {
      console.error(error);
    }
  };

  //delete a post
  const deletePost = async (id) => {
    const ENDPOINT = `/api/v1/posts/${id}`;
    const SINGLE_POST_ENDPOINT = `${HOST}${ENDPOINT}`;
    setProgress(30);
    try {
      //First fetch the post to be deleted so that images can be deleted:
      const toBeDeletedPost = await axios.get(SINGLE_POST_ENDPOINT, {
        withCredentials: true,
        credentials: "include",
      });
      setProgress(50);

      //Fetch the references of images to be deleted:
      const toBeDeletedImages = toBeDeletedPost.data.data.data.imgRef;

      // Delete the post first:
      const response = await axios.delete(SINGLE_POST_ENDPOINT, {
        withCredentials: true,
        credentials: "include",
      });
      setProgress(70);


      // //Delete the images from firebase storage:
      const deletePromises = [];
      toBeDeletedImages.forEach((currentRef)=>{
        const imageRefToBeDeleted = ref(storage, currentRef);
        const res = deleteObject(imageRefToBeDeleted);
        deletePromises.push(res)
      })
      await Promise.all(deletePromises);
      setProgress(100)


      if (response.status === 204) {
        if (location.pathname === "/") window.location.reload();
        else navigate("/");
        showAlert("success", "Post Deleted Successfully");
      } else {
        console.log("Something went wrong!!!, couldn't delete");
        showAlert("danger", "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      showAlert("danger", "Something went wrong");
    }
  };

  //change the status of a post
  const changeStatus =  async(id) => {
    const ENDPOINT = `/api/v1/posts/${id}/changeStatus`;
    const CHANGE_POST_STATUS_ENDPOINT = `${HOST}${ENDPOINT}`;
    try{
      const response = axios.patch(CHANGE_POST_STATUS_ENDPOINT, {}, {
        withCredentials: true,
        credentials: "include",
      });
      console.log(response);

      return true;
    }catch(error){
      console.log(error);
      showAlert("danger", "Something went wrong!")
      return false;
    }

  }

  return (
    <PostContext.Provider
      value={{ posts, getPosts, totalPosts, resetToDefaultState, deletePost, changeStatus, setFilter, filter }}
    >
      {props.children}
    </PostContext.Provider>
  );
};

export default PostState;
