import React, { useState, useEffect, useCallback, memo } from 'react';
import { firestore } from './firebase';

const ObjectListItem = memo(({ object, showObjectChanges }) => (
  <li>
    {showObjectChanges && (
      <>
        <span>Updated at: {new Date(object.updatedAt.seconds * 1000).toLocaleString()}</span>
        <br />
      </>
    )}
    <span>{object.name}</span>
  </li>
));

const ObjectList = () => {
  const [objects, setObjects] = useState([]);
  const [showObjectChanges, setShowObjectChanges] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = firestore.collection('objects').onSnapshot(
      querySnapshot => {
        const updatedObjects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setObjects(updatedObjects);
        setLoading(false);
      },
      error => {
        setError(error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const toggleShowObjectChanges = useCallback(() => setShowObjectChanges(prev => !prev), []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <button onClick={toggleShowObjectChanges}>
        {showObjectChanges ? 'Disable' : 'Enable'} show object changes
      </button>
      <ul>
        {objects.map(object => (
          <ObjectListItem key={object.id} object={object} showObjectChanges={showObjectChanges} />
        ))}
      </ul>
    </>
  );
};

export default ObjectList;
