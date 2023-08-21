import { useState, useEffect } from 'react';
import './styles/App.css';
import Message from './components/Message';
import NoteForm from './components/Notes/NoteForm';
import NotesContainer from './components/Notes/NotesContainer';
import NotesList from './components/Notes/NotesList';
import Note from './components/Notes/Note';
import Preview from './components/Preview';
import Alert from './components/Alert';


function App() {

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);


  useEffect(() => {
    if (localStorage.getItem('notes')) {
      setNotes(JSON.parse(localStorage.getItem('notes')));
    } else {
      localStorage.setItem('notes', JSON.stringify([]));
    }
  }, []);


  useEffect(() => {
    if (validationErrors.length !== 0) {
      setTimeout(() => {
        setValidationErrors([]);
      }, 3000);
    };
  }, [validationErrors]);


  const validate = () => {
    const validationErrors = [];
    let passed = true;

    if (!title) {
      validationErrors.push("الرجاء إدخال عنوان الملاحظة");
      passed = false;
    };

    if (!content) {
      validationErrors.push("الرجاء إدخال محتوى الملاحظة");
      passed = false;
    };

    setValidationErrors(validationErrors);
    return passed;
  };


  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };


  // Go to the Add Note interface:
  const addNoteHandler = () => {
    setCreating(true);
    setEditing(false);
    setTitle('');
    setContent('');
  };

  // Change the title of the note:
  const changeTitleHandler = (event) => {
    setTitle(event.target.value);
  };

  // Change the content of the note:
  const changeContentHandler = (event) => {
    setContent(event.target.value);
  };

  // Note Saving:
  const saveNoteHandler = () => {
    if (!validate()) return;

    const note = {
      id: new Date(),
      title: title,
      content: content
    };

    const updatedNotes = [...notes, note];

    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setCreating(false);
    setSelectedNote(note.id);
    setTitle('');
    setContent('');
  };

  // Note Selection:
  const selectNoteHandler = noteId => {
    setSelectedNote(noteId);
    setCreating(false);
    setEditing(false);
  };

  // Go to the Edit Note interface:
  const editNoteHandler = () => {
    const note = notes.find(note => note.id === selectedNote);
    setEditing(true);
    setTitle(note.title);
    setContent(note.content);
  };

  // Note Editing:
  const updateNoteHandler = () => {
    if (!validate()) return;

    const updatedNotes = [...notes];
    const noteIndex = updatedNotes.findIndex(note => note.id === selectedNote);
    updatedNotes[noteIndex] = {
      id: selectedNote,
      title: title,
      content: content
    };

    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setEditing(false);
    setTitle('');
    setContent('');
  };

  // Note Deleting:
  const deleteNoteHandler = () => {
    const updatedNotes = [...notes];
    const noteIndex = updatedNotes.findIndex(note => note.id === selectedNote);
    updatedNotes.splice(noteIndex, 1);

    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setSelectedNote(null);
  };


  const getAddNote = () => {
    return (
      <NoteForm
        formTitle="إضافة ملاحظة جديدة"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="حفظ"
        submitClicked={saveNoteHandler}
      />
    );
  };

  const getPreview = () => {
    if (notes.length === 0) {
      return <Message title="لا توجد ملاحظات" />
    };

    if (!selectedNote) {
      return <Message title="إختر ملاحظة لعرضها" />
    };

    const note = notes.find(note => {
      return note.id === selectedNote;
    });

    let noteDisplay = (
      <div>
        <h2>{note.title}</h2>
        <p>{note.content}</p>
      </div>
    );

    if (editing) {
      noteDisplay = (
        <NoteForm
          formTitle="تعديل ملاحظة"
          title={title}
          content={content}
          titleChanged={changeTitleHandler}
          contentChanged={changeContentHandler}
          submitText="تعديل"
          submitClicked={updateNoteHandler}
        />
      );
    };

    return (
      <div>
        {!editing &&
          <div className="note-operations">
            <a href="#" onClick={editNoteHandler}>
              <i className="fa fa-pencil-alt" />
            </a>
            <a href="#" onClick={deleteNoteHandler}>
              <i className="fa fa-trash" />
            </a>
          </div>
        }
        {noteDisplay}
      </div>
    );
  };

  return (
    <div className="App">
      <NotesContainer>
        <NotesList>
          {notes.map(note =>
            <Note
              key={note.id}
              title={note.title}
              active={note.id === selectedNote}
              noteClicked={() => selectNoteHandler(note.id)}
            />
          )}
        </NotesList>
        <button className="add-btn" onClick={addNoteHandler}>+</button>
      </NotesContainer>
      <Preview>
        {creating ? getAddNote() : getPreview()}
      </Preview>
      {validationErrors.length !== 0 && <Alert validationMessages={validationErrors} />}
    </div>
  );
}

export default App;