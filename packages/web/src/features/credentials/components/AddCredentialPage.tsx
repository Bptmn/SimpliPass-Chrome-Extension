import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/AddCredentialPage.css';

export const AddCredentialPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate saving
    setTimeout(() => {
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/')} aria-label="Retour">
            ←
          </button>
          <div className="details-title">Ajouter un identifiant</div>
        </div>
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-section">
            <label className="input-label">Nom de l'identifiant</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de l'identifiant"
            />
          </div>
          <div className="form-section">
            <label className="input-label">Email / Nom d'utilisateur</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email / Nom d'utilisateur"
            />
          </div>
          <div className="form-section">
            <label className="input-label">Mot de passe</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
            />
          </div>
          <div className="form-section">
            <label className="input-label">Lien (optionnel)</label>
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Lien"
            />
          </div>
          <div className="form-section">
            <label className="input-label">Note (optionnel)</label>
            <input
              className="input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
            />
          </div>
          <button className="btn btn-primary full-width" type="submit" disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  );
};