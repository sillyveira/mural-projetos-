'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Estados para POST
  const [newProject, setNewProject] = useState({
    title: 'Projeto Teste',
    description: 'Descrição do projeto de teste',
    author: 'João Silva',
    githubUrl: 'https://github.com/test/project',
    status: 'EM DESENVOLVIMENTO'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Estados para GET
  const [filters, setFilters] = useState({
    author: '',
    title: '',
    status: '',
    limit: '',
    skip: ''
  });

  // Estado para DELETE
  const [deleteId, setDeleteId] = useState('');

  const handleGET = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const url = `/api${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      setResponse({ method: 'GET', status: res.status, data });
    } catch (error) {
      setResponse({ method: 'GET', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handlePOST = async () => {
    setLoading(true);
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('title', newProject.title);
      formData.append('description', newProject.description);
      formData.append('author', newProject.author);
      formData.append('githubUrl', newProject.githubUrl);
      formData.append('status', newProject.status);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const res = await fetch('/api', {
        method: 'POST',
        body: formData // Não definir Content-Type, o browser faz automaticamente
      });
      const data = await res.json();
      setResponse({ method: 'POST', status: res.status, data });
    } catch (error) {
      setResponse({ method: 'POST', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleDELETE = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api?id=${deleteId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setResponse({ method: 'DELETE', status: res.status, data });
    } catch (error) {
      setResponse({ method: 'DELETE', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Teste de API - Projetos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Requisições */}
          <div className="space-y-6">
            
            {/* GET - Listar Projetos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-green-600">GET - Listar Projetos</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Autor"
                  value={filters.author}
                  onChange={(e) => setFilters({...filters, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="text"
                  placeholder="Título"
                  value={filters.title}
                  onChange={(e) => setFilters({...filters, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Status (Todos)</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="EM DESENVOLVIMENTO">EM DESENVOLVIMENTO</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Limit"
                    value={filters.limit}
                    onChange={(e) => setFilters({...filters, limit: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="number"
                    placeholder="Skip"
                    value={filters.skip}
                    onChange={(e) => setFilters({...filters, skip: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button
                  onClick={handleGET}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {loading ? 'Carregando...' : 'Listar Projetos'}
                </button>
              </div>
            </div>

            {/* POST - Criar Projeto */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-600">POST - Criar Projeto</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Título"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Descrição"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Autor"
                  value={newProject.author}
                  onChange={(e) => setNewProject({...newProject, author: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="url"
                  placeholder="URL do GitHub"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EM DESENVOLVIMENTO">EM DESENVOLVIMENTO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                </select>
                
                {/* Upload de Imagem */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagem do Projeto *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-md border border-gray-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Formatos aceitos: JPG, PNG, GIF. Máximo: 5MB
                  </p>
                </div>
                
                <button
                  onClick={handlePOST}
                  disabled={loading || !imageFile}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {loading ? 'Criando...' : 'Criar Projeto'}
                </button>
              </div>
            </div>

            {/* DELETE - Deletar Projeto */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-red-600">DELETE - Deletar Projeto</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="ID do Projeto (ObjectId)"
                  value={deleteId}
                  onChange={(e) => setDeleteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-sm text-gray-600">
                  Dica: Use GET para listar projetos e copiar um ID (_id) válido
                </p>
                <button
                  onClick={handleDELETE}
                  disabled={loading || !deleteId}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {loading ? 'Deletando...' : 'Deletar Projeto'}
                </button>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resposta */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Resposta da API</h2>
              {response ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-700">Método:</span>
                    <span className={`px-3 py-1 rounded-full text-white font-medium ${
                      response.method === 'GET' ? 'bg-green-600' :
                      response.method === 'POST' ? 'bg-blue-600' :
                      'bg-red-600'
                    }`}>
                      {response.method}
                    </span>
                  </div>
                  {response.status && (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-700">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-white font-medium ${
                        response.status >= 200 && response.status < 300 ? 'bg-green-600' :
                        response.status >= 400 ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}>
                        {response.status}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-gray-700 block mb-2">Dados:</span>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                      {JSON.stringify(response.data || response.error, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma requisição realizada ainda. Use os formulários à esquerda para testar as rotas.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
