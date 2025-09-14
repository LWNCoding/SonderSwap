import React from 'react';
import { typography } from '../lib/typography';
import { COMMON_STYLES } from '../lib/styles';
import { FOOTER_LINKS, LAYOUT_CONSTANTS } from '../lib/navigation';

const Footer: React.FC = () => {
  const renderFooterBrand = (): JSX.Element => (
    <div className={LAYOUT_CONSTANTS.BRAND_SPAN}>
      <h3 className={`${typography.footerBrand} text-primary-400 mb-4`}>SonderSwap</h3>
      <p className={`${typography.footerText} text-gray-400 mb-4 max-w-md`}>
        Empowering communities to share skills, host workshops, and organize maker fairs all in one place.
      </p>
    </div>
  );

  const renderQuickLinks = (): JSX.Element => (
    <div>
      <h4 className={`${typography.footerHeading} mb-4`}>Quick Links</h4>
      <ul className="space-y-2">
        {FOOTER_LINKS.QUICK_LINKS.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className={`${typography.footerText} text-gray-400 hover:text-white transition-colors duration-200`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderContact = (): JSX.Element => (
    <div>
      <h4 className={`${typography.footerHeading} mb-4`}>Contact</h4>
      <div className={`space-y-2 ${typography.footerText} text-gray-400`}>
        <p>{FOOTER_LINKS.CONTACT.EMAIL}</p>
        <p>{FOOTER_LINKS.CONTACT.LOCATION}</p>
      </div>
    </div>
  );

  return (
    <footer className="bg-gray-900 text-white">
      <div className={`${COMMON_STYLES.LAYOUT.MAX_WIDTH} mx-auto ${COMMON_STYLES.LAYOUT.CONTAINER_PADDING} ${LAYOUT_CONSTANTS.FOOTER_PADDING}`}>
        <div className={`grid ${LAYOUT_CONSTANTS.FOOTER_GRID} gap-8`}>
          {renderFooterBrand()}
          {renderQuickLinks()}
          {renderContact()}
        </div>

        {/* Bottom Bar */}
        <div className={`border-t border-gray-800 ${LAYOUT_CONSTANTS.BOTTOM_BAR_PADDING} text-center text-gray-400`}>
          <p className={typography.footerText}>&copy; {FOOTER_LINKS.COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
