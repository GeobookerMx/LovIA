import { Link } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="app-footer__logo">Lov<span className="text-gradient">IA!</span></div>
            
            <p className="app-footer__text">
                Construyendo relaciones más fuertes y saludables a través de ciencia y tecnología.
            </p>
            
            <a href="mailto:clienteslovia@gmail.com" className="app-footer__contact">
                <Mail size={16} />
                clienteslovia@gmail.com
            </a>

            <div className="app-footer__links">
                <Link to="/profile/legal" className="app-footer__link">Aviso de Privacidad</Link>
                <Link to="/profile/legal" className="app-footer__link">Términos de Uso</Link>
                <Link to="/profile/legal" className="app-footer__link">
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                    Desarrollo Seguro
                </Link>
            </div>

            <span className="app-footer__copyright">
                © {new Date().getFullYear()} LovIA. Todos los derechos reservados.
            </span>
        </footer>
    )
}
