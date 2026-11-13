import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="app-footer">
            <div className="app-footer__logo">Lov<span className="text-gradient">IA!</span></div>
            
            <p className="app-footer__text">
                Un espacio para conocer personas, conversar y reflexionar a tu ritmo.
            </p>
            
            <a href="mailto:clienteslovia@gmail.com" className="app-footer__contact">
                <Mail size={16} />
                clienteslovia@gmail.com
            </a>

            <div className="app-footer__links">
                <Link to="/privacy" className="app-footer__link">Aviso de privacidad</Link>
                <Link to="/profile/legal" className="app-footer__link">Ayuda y seguridad</Link>
            </div>

            <span className="app-footer__copyright">
                © {new Date().getFullYear()} LovIA. Todos los derechos reservados.
            </span>
        </footer>
    )
}
