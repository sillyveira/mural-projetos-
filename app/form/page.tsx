"use client";

import { useRouter } from "next/navigation";
import { Toaster, toast } from 'react-hot-toast';
import React, { useState } from "react";
import Image from "next/image";
import { z } from "zod";
import Header from '../components/Header';
import { fonts, colors } from '../utils/theme';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60';

const projectSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório'),
  description: z.string()
    .min(10, 'Descrição deve ter ao menos 10 caracteres')
    .max(60, 'Descrição deve ter no máximo 60 caracteres'),
  author: z.string()
    .min(1, 'Autor é obrigatório'),
  githubUrl: z
    .string()
    .url({ message: 'URL inválida' }),
  status: z.enum(['FINALIZADO', 'EM DESENVOLVIMENTO']),
  image: z.instanceof(File).optional()
    .refine((file) => !file || file.size <= MAX_IMAGE_SIZE, {
      message: 'A imagem deve ter no máximo 5MB',
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: 'Tipos de imagem aceitos: JPEG, JPG, PNG, WEBP',
    }),
});

export default function ProjectForm() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    githubUrl: 'https://',
    status: 'EM DESENVOLVIMENTO' as 'FINALIZADO' | 'EM DESENVOLVIMENTO',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validar dados com Zod
      const validatedData = projectSchema.parse({
        ...formData,
        image: selectedImage || undefined,
      });

      // Criar FormData para enviar arquivo + dados
      const submitData = new FormData();
      submitData.append('title', validatedData.title);
      submitData.append('description', validatedData.description);
      submitData.append('author', validatedData.author);
      submitData.append('githubUrl', validatedData.githubUrl);
      submitData.append('status', validatedData.status);

      // Se tiver imagem, adiciona ao FormData. Senão, baixa imagem padrão e adiciona
      if (selectedImage) {
        submitData.append('image', selectedImage);
      } else {
        const response = await fetch(DEFAULT_IMAGE_URL);
        const blob = await response.blob();
        const defaultImageFile = new File([blob], 'default-image.jpg', { type: 'image/jpeg' });
        submitData.append('image', defaultImageFile);
      }

      // Enviar para a API
      const apiResponse = await fetch('/api', {
        method: 'POST',
        body: submitData,
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok || !result.success) {
        throw new Error(result.error || result.message || 'Erro ao enviar o formulário');
      }

      toast.success('Projeto enviado com sucesso!');

    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten((issue) => issue.message).fieldErrors);
        toast.error('Verifique os campos obrigatórios');
      } else {
        console.error('Erro ao enviar:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao enviar projeto');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-6 py-2 rounded-lg bg-white/5 ${colors.border.default} ${colors.text.white} placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors ${fonts.body}`;

  return (
    <div className={`${colors.background.primary} min-h-screen px-6 py-8 md:py-12 lg:px-20`}>
      <Header hideQrCode={true}>
      </Header>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto px-6 py-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do Projeto */}
          <div>
            <label className={`block ${colors.text.white} mb-2`}>
              Nome do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Sistema de Gestão Acadêmica"
              className={inputClass}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
          </div>

          {/* Descrição do Projeto */}
          <div>
            <label className={`block ${colors.text.white} mb-2`}>
              Descrição (max. 60 caracteres)<span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={60}
              placeholder="Descreva seu projeto em poucas palavras"
              rows={4}
              className={inputClass}
            />
            <div className="flex justify-end">
              <span className={`${colors.text.subtle} text-xs mt-1`}>
                {formData.description.length}/60
              </span>
            </div>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
          </div>

          {/* Autor do Projeto */}
          <div>
            <label className={`block ${colors.text.white} mb-2`}>
              Autor(es) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Ex: Maria Silva"
              className={inputClass}
            />
            {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author[0]}</p>}
          </div>

          {/* URL do GitHub */}
          <div>
            <label className={`block ${colors.text.white} mb-2`}>
              URL do GitHub <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="Ex: https://github.com/usuario/projeto"
              className={inputClass}

            />
            {errors.githubUrl && <p className="text-red-500 text-sm mt-1">{errors.githubUrl[0]}</p>}
          </div>

          {/* Status do Projeto */}
          <div>
            <label className={`block ${colors.text.white} mb-2`}>
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option className="text-black" value="EM DESENVOLVIMENTO">Em Desenvolvimento</option>
              <option className="text-black" value="FINALIZADO">Finalizado</option>
            </select>
          </div>

          {/* Imagem do Projeto */}
          <div>
            <label className={`block ${colors.text.white} mb-2`}>
              Imagem do Projeto (Opcional), (máx. 5MB)
            </label>
            <div
              onClick={() => document.getElementById('imageInput')?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${errors.image ? 'border-red-500' : imagePreview ? 'border-blue-400' : 'border-white/30 hover:border-white/50'
                }`}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="max-h-64 w-auto mx-auto rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(undefined);
                      setSelectedImage(null);
                    }}
                    className={`px-4 py-2 ${colors.border.default} rounded-lg ${colors.text.white} hover:bg-white/10 transition`}
                  >
                    Remover imagem
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 text-blue-400 mx-auto">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                  <p className={`${colors.text.white} text-sm ${fonts.body}`}>
                    Clique para enviar uma imagem
                  </p>
                  <p className={`${colors.text.subtle} text-xs ${fonts.body}`}>
                    JPG, JPEG PNG ou WEBP
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              id="imageInput"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={handleImageChange}
              className="hidden"
            />
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>}
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Upload className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Enviar Projeto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}