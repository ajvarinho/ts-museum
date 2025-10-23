import './header.css';
import Link from 'next/link';

interface HeaderProps {
    isLoading: boolean;
}


const Header: React.FC<HeaderProps> = ({ isLoading }) => {
    // accept message - loaded

    return(
        <header>
            <h1 className={'title' + (isLoading ? '' : ' loaded')}>
                MUSEO
            </h1>

            <Link href="/gallery">gallery</Link>
        </header>
    )
}

export default Header;