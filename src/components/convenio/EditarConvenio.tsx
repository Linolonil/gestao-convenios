import { useParams } from 'react-router-dom';
import FormularioConvenio from './FormularioConvenio';

const EditarConvenio = () => {
  const { id } = useParams();
  
  return <FormularioConvenio convenioId={id ? parseInt(id) : undefined} />;
};

export default EditarConvenio;
