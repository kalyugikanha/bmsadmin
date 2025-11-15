import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate

const EditBlog = () => {
  const { blogId } = useParams(); // Get blogId from URL parameters
  const navigate = useNavigate(); // For redirection after update
  const { user } = useAuth();
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState(''); // Holds HTML content from Quill
  const [featuredImage, setFeaturedImage] = useState(null); // For a dedicated featured image
  const [otherImages, setOtherImages] = useState([]); // For other images
  const [originalOtherImages, setOriginalOtherImages] = useState([]); // To display existing other images
  const [category, setCategory] = useState('');
  const [writtenBy, setWrittenBy] = useState('');
  const [metaTags, setMetaTags] = useState('');
  const [keywords, setKeywords] = useState('');
  const [qaSections, setQaSections] = useState([{ question: '', answer: '' }]); // New state for Q&A sections
  const [isPublishing, setIsPublishing] = useState(false); // Renamed to isUpdating for clarity
  const [showPreview, setShowPreview] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(true); // New state for loading existing blog
  const [originalFeaturedImageUrl, setOriginalFeaturedImageUrl] = useState(''); // To display existing image
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubePreview, setYoutubePreview] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) return;

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('accessToken');

      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        setLoadingBlog(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/blogs/${blogId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch blog details');
        }

        const data = await response.json();
        setBlogTitle(data.title);
        setBlogContent(data.content);
        setCategory(data.category || '');
        setMetaTags(data.meta_tags || '');
        setKeywords(data.keywords || '');
        setWrittenBy(data.written_by || '');
        setOriginalFeaturedImageUrl(data.featured_image || ''); // Set original image URL
        setOriginalOtherImages(data.other_images || []); // Set original other images
        console.log("Original Other Images from API:", data.other_images);
        console.log("State originalOtherImages after set:", data.other_images || []);
        // Pre-populate qaSections if data exists
        if (data.qa_section && data.qa_section.length > 0) {
          setQaSections(data.qa_section);
        } else {
          setQaSections([{ question: '', answer: '' }]); // Ensure at least one empty Q&A field
        }
      } catch (error) {
        toast.error(error.message);
        navigate('/dashboard/blogs/view'); // Redirect if blog not found or error
      } finally {
        setLoadingBlog(false);
      }
    };

    fetchBlog();
  }, [blogId, navigate]); // Re-run if blogId or navigate changes

  // Custom image handler for Quill - supports both file upload and URL
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');
      
      // Custom image handler - opens modal
      toolbar.addHandler('image', function() {
        setShowImageModal(true);
        setImageUrl('');
      });
    }
  }, []);

  // Handle file upload to S3
  const handleImageFileUpload = async (file) => {
    if (!file) return;

    setIsUploadingImage(true);
    const quill = quillRef.current?.getEditor();
    if (!quill) {
      setIsUploadingImage(false);
      return;
    }

    // Show loading indicator
    const range = quill.getSelection(true);
    quill.insertText(range.index, 'Uploading image...', 'user');
    quill.setSelection(range.index + 20);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const token = localStorage.getItem('accessToken');
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${backendUrl}/api/blogs/image-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to parse JSON error, otherwise fallback to text (HTML)
        let msg = 'Failed to upload image';
        try {
          const errorData = await response.json();
          msg = errorData?.message || JSON.stringify(errorData) || msg;
        } catch (parseErr) {
          try {
            const text = await response.text();
            if (text) msg = text;
          } catch (_) {
            // ignore
          }
        }
        throw new Error(msg);
      }

      // Parse successful response; accept JSON or fallback to text for diagnostics
      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await response.text().catch(() => null);
        console.error('Image upload returned non-JSON response:', text || jsonErr);
        throw new Error(text || 'Image upload returned invalid response');
      }

      const uploadedImageUrl = data?.imageUrl || data?.url || data?.path;
      if (!uploadedImageUrl) {
        console.error('Upload response missing image URL:', data);
        throw new Error('Upload succeeded but server response did not include image URL');
      }

      // Remove "Uploading image..." text
      quill.deleteText(range.index, 20);
      
      // Insert image at cursor position
      quill.insertEmbed(range.index, 'image', uploadedImageUrl, 'user');
      
      toast.success('Image uploaded successfully!');
      setShowImageModal(false);
      setImageUrl('');
    } catch (error) {
      // Remove "Uploading image..." text
      quill.deleteText(range.index, 20);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle URL insertion
  const handleImageUrlInsert = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'image', imageUrl.trim(), 'user');
    toast.success('Image URL added!');
    setShowImageModal(false);
    setImageUrl('');
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFileUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // YouTube helpers: extract ID, preview and insert clickable thumbnail that opens in new tab
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  };

  const handleYoutubePreview = () => {
    const id = extractYouTubeId(youtubeUrl.trim());
    if (!id) {
      toast.error('Please enter a valid YouTube URL');
      setYoutubePreview('');
      return;
    }
    setYoutubePreview(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
  };

  const handleInsertYouTube = () => {
    const id = extractYouTubeId(youtubeUrl.trim());
    if (!id) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    const link = `https://youtu.be/${id}`;
    const html = `<a href="${link}" target="_blank" rel="noopener noreferrer"><img src="${thumb}" alt="YouTube Video" style="max-width:100%;" /></a>`;
    quill.clipboard.dangerouslyPasteHTML(range.index, html, 'user');
    toast.success('YouTube video inserted (opens in new tab)');
    setYoutubeUrl('');
    setYoutubePreview('');
    setShowImageModal(false);
  };

  const handleAddQaSection = () => {
    setQaSections([...qaSections, { question: '', answer: '' }]);
  };

  const handleRemoveQaSection = (index) => {
    const newQaSections = [...qaSections];
    newQaSections.splice(index, 1);
    setQaSections(newQaSections);
  };

  const handleQaChange = (index, field, value) => {
    const newQaSections = [...qaSections];
    newQaSections[index][field] = value;
    setQaSections(newQaSections);
  };

  // Quill Editor Modules - defines the toolbar options
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headings
      ['bold', 'italic', 'underline', 'strike'], // Basic formatting
      ['blockquote', 'code-block'], // Blockquote and code
      [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
      [{ 'script': 'sub'}, { 'script': 'super' }], // Subscript/superscript
      [{ 'indent': '-1'}, { 'indent': '+1' }], // Indentation
      [{ 'direction': 'rtl' }], // Text direction
      [{ 'size': ['small', false, 'large', 'huge'] }], // Font size
      [{ 'color': [] }, { 'background': [] }], // Text/background color
      [{ 'font': [] }], // Font family
      [{ 'align': [] }], // Text alignment
      ['link', 'image', 'video'], // Links, images, videos
      ['clean'] // Remove formatting
    ],
  };

  // Quill Editor Formats - ensures correct HTML output for the modules
  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'script', 'indent', 'direction', 'size', 'color', 'background',
    'font', 'align', 'link', 'image', 'video',
  ];

  const handleFeaturedImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFeaturedImage(e.target.files[0]);
    }
  };

  const handleOtherImagesChange = (e) => {
    if (e.target.files) {
      setOtherImages(prevImages => [...prevImages, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveOtherImage = (index) => {
    const newImages = [...otherImages];
    newImages.splice(index, 1);
    setOtherImages(newImages);
  };

  const handleRemoveOriginalOtherImage = (index) => {
    const newOriginalImages = [...originalOtherImages];
    newOriginalImages.splice(index, 1);
    setOriginalOtherImages(newOriginalImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true); // Use isPublishing for consistency, or rename to isUpdating

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('accessToken');

    const formData = new FormData();
    formData.append('title', blogTitle);
    formData.append('content', blogContent);
    formData.append('category', category);
    formData.append('meta_tags', metaTags);
    formData.append('keywords', keywords);
    formData.append('written_by', writtenBy);
    // Append qaSections as a JSON string
    formData.append('qa_section', JSON.stringify(qaSections));
    // Only append new featured image if selected
    if (featuredImage) {
      formData.append('featured_image', featuredImage);
    } else if (originalFeaturedImageUrl) {
      // If no new image, but there was an original, send its URL to retain it
      formData.append('featured_image_url_to_retain', originalFeaturedImageUrl);
    }

    if (otherImages.length > 0) {
      otherImages.forEach(image => {
        formData.append('other_images', image);
      });
    }
    formData.append('original_other_images', JSON.stringify(originalOtherImages));

    try {
      const response = await fetch(`${backendUrl}/api/blogs/${blogId}`,
        {
          method: 'PUT',
          headers: {
            // No 'Content-Type' header for FormData when uploading files, browser sets it
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        // Try to parse JSON error, otherwise fall back to plain text
        let msg = 'Failed to update blog post';
        try {
          const errorData = await response.json();
          msg = errorData?.message || JSON.stringify(errorData) || msg;
        } catch (parseErr) {
          try {
            const text = await response.text();
            if (text) msg = text;
          } catch (_) {
            // ignore
          }
        }
        throw new Error(msg);
      }

      toast.success('Blog Updated Successfully!'); // Use toast notification
      navigate('/dashboard/blogs/view'); // Redirect to view all blogs after successful update
    } catch (error) {
      console.error('Error updating blog post:', error);
      const extra = error.name === 'AbortError' ? ' (request aborted)' : (error.code ? ` (${error.code})` : '');
      toast.error(`Failed to update blog post: ${error.message}${extra}`);
    } finally {
      setIsPublishing(false); // Use isPublishing for consistency
    }
  };

  if (loadingBlog) {
    return <div className="text-center py-10">Loading blog for editing...</div>;
  }

  return (
    <div className="bg-staymaster-white-bg rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-staymaster-text-dark mb-4">Edit Blog</h2>
      <p className="text-staymaster-text-gray mb-6">
        Modify your existing blog post.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="blogTitle" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Blog Title
          </label>
          <input
            type="text"
            id="blogTitle"
            className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
            placeholder="Enter blog title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="writtenBy" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Written By
          </label>
          <input
            type="text"
            id="writtenBy"
            className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
            placeholder="Enter author's name"
            value={writtenBy}
            onChange={(e) => setWrittenBy(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Blog Content
          </label>
          <div className="bg-white border border-staymaster-border-light rounded-lg">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={blogContent}
              onChange={setBlogContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Start writing your blog content here..."
              className="h-64 mb-10" // Adjust height as needed
            />
          </div>
          {/* Add some space below Quill editor due to its fixed height behavior */}
          <div className="mb-16"></div>
        </div>

        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Featured Image (Optional)
          </label>
          <input
            type="file"
            id="featuredImage"
            className="w-full text-sm text-staymaster-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-staymaster-primary file:text-white hover:file:bg-teal-700 cursor-pointer"
            onChange={handleFeaturedImageChange}
            accept="image/*"
          />
          {(featuredImage || originalFeaturedImageUrl) && (
            <div className="mt-2">
              {featuredImage ? (
                <p className="text-sm text-gray-500">Selected new file: {featuredImage.name}</p>
              ) : (
                <p className="text-sm text-gray-500">Current file: <a href={originalFeaturedImageUrl} target="_blank" rel="noopener noreferrer">{originalFeaturedImageUrl.split('/').pop()}</a></p>
              )}
              {originalFeaturedImageUrl && !featuredImage && (
                <img src={originalFeaturedImageUrl} alt="Current Featured" className="max-w-xs h-auto mt-2 rounded-lg" />
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="otherImages" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Other Images (Optional)
          </label>
          <input
            type="file"
            id="otherImages"
            className="w-full text-sm text-staymaster-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-staymaster-primary file:text-white hover:file:bg-teal-700 cursor-pointer"
            onChange={handleOtherImagesChange}
            accept="image/*"
            multiple
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {originalOtherImages.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Original Other ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleRemoveOriginalOtherImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  X
                </button>
              </div>
            ))}
            {otherImages.map((image, index) => (
              <div key={index} className="relative">
                <img src={URL.createObjectURL(image)} alt={`New Other ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => handleRemoveOtherImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="metaTags" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Meta Tags
          </label>
          <input
            type="text"
            id="metaTags"
            className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
            placeholder="Enter meta tags, separated by commas"
            value={metaTags}
            onChange={(e) => setMetaTags(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-staymaster-text-dark mb-1">
            Keywords
          </label>
          <input
            type="text"
            id="keywords"
            className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
            placeholder="Enter keywords, separated by commas"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        {/* Q&A Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-staymaster-text-dark">Question & Answer Section</h3>
          {qaSections.map((qa, index) => (
            <div key={index} className="border border-staymaster-border-light rounded-lg p-4 space-y-3">
              <div>
                <label htmlFor={`question-${index}`} className="block text-sm font-medium text-staymaster-text-dark mb-1">
                  Question {index + 1}
                </label>
                <input
                  type="text"
                  id={`question-${index}`}
                  className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
                  placeholder="Enter question"
                  value={qa.question}
                  onChange={(e) => handleQaChange(index, 'question', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor={`answer-${index}`} className="block text-sm font-medium text-staymaster-text-dark mb-1">
                  Answer {index + 1}
                </label>
                <textarea
                  id={`answer-${index}`}
                  rows="3"
                  className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
                  placeholder="Enter answer"
                  value={qa.answer}
                  onChange={(e) => handleQaChange(index, 'answer', e.target.value)}
                ></textarea>
              </div>
              {qaSections.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQaSection(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove Q&A
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQaSection}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
          >
            Add Q&A Section
          </button>
        </div>

        <div className="flex items-center space-x-4 pt-4">
          <button
            type="submit"
            className="bg-staymaster-primary hover:bg-teal-700 text-staymaster-white-bg font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out text-base"
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Blog'}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="border border-staymaster-primary text-staymaster-primary hover:bg-staymaster-primary hover:text-white font-bold py-2.5 px-6 rounded-lg transition duration-200 ease-in-out text-base"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </form>

      {showPreview && (
        <div className="mt-10 p-6 border border-staymaster-border-light rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold text-staymaster-text-dark mb-4">Blog Preview</h3>
          <div className="prose max-w-none"> {/* 'prose' class from @tailwindcss/typography (if installed) for better rendering of HTML */}
            <h1 className="text-3xl font-bold mb-2">{blogTitle || 'Untitled Blog'}</h1>
            <p className="text-sm text-gray-600 mb-4">By {writtenBy || user?.email || 'Unknown Author'}</p>
            {(featuredImage || originalFeaturedImageUrl) && (
              <div className="mb-4">
                <img
                  src={featuredImage ? URL.createObjectURL(featuredImage) : originalFeaturedImageUrl}
                  alt="Featured Preview"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            <div
              className="blog-content-preview text-staymaster-text-dark"
              dangerouslySetInnerHTML={{ __html: blogContent }}
            />
          </div>
          <p className="mt-6 text-sm text-red-600">
            <strong>Security Warning:</strong> This preview uses `dangerouslySetInnerHTML`. In a production environment,
            always sanitize user-generated HTML content on the server to prevent XSS vulnerabilities.
          </p>
        </div>
      )}

      {/* Image Insert Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-staymaster-text-dark mb-4">Insert Image</h3>
            
            <div className="space-y-4">
              {/* Option 1: Upload File */}
              <div>
                <label className="block text-sm font-medium text-staymaster-text-dark mb-2">
                  Option 1: Upload Image File (to S3)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  disabled={isUploadingImage}
                  className="w-full text-sm text-staymaster-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-staymaster-primary file:text-white hover:file:bg-teal-700 cursor-pointer disabled:opacity-50"
                />
                {isUploadingImage && (
                  <p className="mt-2 text-sm text-blue-600">Uploading image...</p>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Option 2: Enter URL */}
              <div>
                <label className="block text-sm font-medium text-staymaster-text-dark mb-2">
                  Option 2: Enter Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleImageUrlInsert();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleImageUrlInsert}
                  className="mt-2 w-full bg-staymaster-primary hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
                >
                  Insert URL
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Option 3: YouTube URL */}
              <div>
                <label className="block text-sm font-medium text-staymaster-text-dark mb-2">
                  Option 3: Insert YouTube URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtu.be/VIDEO_ID or https://www.youtube.com/watch?v=VIDEO_ID"
                  className="w-full px-4 py-2 border border-staymaster-border-light rounded-lg focus:ring-staymaster-primary focus:border-staymaster-primary outline-none text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleYoutubePreview();
                    }
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleYoutubePreview}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
                  >
                    Preview Thumbnail
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertYouTube}
                    className="flex-1 bg-staymaster-primary hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
                  >
                    Insert YouTube
                  </button>
                </div>
                {youtubePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Thumbnail preview (click to open YouTube):</p>
                    <a href={youtubePreview.replace('/hqdefault.jpg', '')} target="_blank" rel="noopener noreferrer">
                      <img src={youtubePreview} alt="YouTube thumbnail" className="w-full h-auto rounded-lg" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowImageModal(false);
                setImageUrl('');
              }}
              className="mt-4 w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out text-sm"
              disabled={isUploadingImage}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBlog;