import logo from '../logo.png';

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "w-10 h-10" }: LogoProps) {
    return (
        <img
            src={logo}
            alt="WhatsOrder Logo"
            className={`${className} rounded-xl object-contain shadow-sm border border-green-100/50`}
        />
    );
}
