import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import { Trans } from "@lingui/macro";

import gmxBigIcon from "img/ic_gmx_custom.svg";
import glpBigIcon from "img/ic_glp_custom.svg";

import { isHomeSite } from "lib/legacy";

import { useWeb3React } from "@web3-react/core";

import APRLabel from "../APRLabel/APRLabel";
import { HeaderLink } from "../Header/HeaderLink";
import { ARBITRUM, TELOS_TESTNET } from "config/chains";
import { switchNetwork } from "lib/wallets";
import { useChainId } from "lib/chains";
import ExternalLink from "components/ExternalLink/ExternalLink";

export default function TokenCard({ showRedirectModal, redirectPopupTimestamp }) {
  const isHome = isHomeSite();
  const { chainId } = useChainId();
  const { active } = useWeb3React();

  const changeNetwork = useCallback(
    (network) => {
      if (network === chainId) {
        return;
      }
      if (!active) {
        setTimeout(() => {
          return switchNetwork(network, active);
        }, 500);
      } else {
        return switchNetwork(network, active);
      }
    },
    [chainId, active]
  );

  const BuyLink = ({ className, to, children, network }) => {
    if (isHome && showRedirectModal) {
      return (
        <HeaderLink
          to={to}
          className={className}
          redirectPopupTimestamp={redirectPopupTimestamp}
          showRedirectModal={showRedirectModal}
        >
          {children}
        </HeaderLink>
      );
    }

    return (
      <Link to={to} className={className} onClick={() => changeNetwork(network)}>
        {children}
      </Link>
    );
  };

  return (
    <div className="Home-token-card-options">
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-icon">
          <img src={gmxBigIcon} alt="gmxBigIcon" /> Add Liquidity (OmniDex Classic)
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>Visit the classic OmniDex site to add liquidity for any asset.</Trans>
          </div>
          {/*<div className="Home-token-card-option-apr"> */}
          {/* <Trans>Arbitrum APR:</Trans> <APRLabel chainId={ARBITRUM} label="gmxAprTotal" />,{" "} */}
          {/* <Trans>Telos APR:</Trans> <APRLabel chainId={TELOS_TESTNET} label="gmxAprTotal" key="AVALANCHE" />
          </div> */}
          <div className="Home-token-card-option-action">
            {/* <div className="buy"> */}
            {/*  <BuyLink to="/buy_gmx" className="default-btn" network={ARBITRUM}>
                <Trans>Buy on Arbitrum</Trans>
              </BuyLink> */}
            {/* <BuyLink to="/buy_gmx" className="default-btn" network={TELOS_TESTNET}>
                <Trans>Buy</Trans>
              </BuyLink>
            </div>*/}

            <ExternalLink href="https://omnidex.finance/liquidity" className="default-btn read-more">
              <Trans>Add Liquidity (OmniDex Classic)</Trans>
            </ExternalLink>
          </div>
        </div>
      </div>
      <div className="Home-token-card-option">
        <div className="Home-token-card-option-icon">
          <img src={glpBigIcon} alt="glpBigIcon" /> OLP
        </div>
        <div className="Home-token-card-option-info">
          <div className="Home-token-card-option-title">
            <Trans>OLP is the liquidity provider token. Accrues 70% of the platform's generated fees.</Trans>
          </div>
          <div className="Home-token-card-option-apr">
            {/* <Trans>Arbitrum APR:</Trans> <APRLabel chainId={ARBITRUM} label="glpAprTotal" key="ARBITRUM" />,{" "} */}
            <Trans>Telos APR:</Trans> <APRLabel chainId={TELOS_TESTNET} label="glpAprTotal" key="AVALANCHE" />
          </div>
          <div className="Home-token-card-option-action">
            <div className="buy">
              {/* <BuyLink to="/buy_olp" className="default-btn" network={ARBITRUM}>
                <Trans>Buy on Arbitrum</Trans>
              </BuyLink> */}
              <BuyLink to="/buy_olp" className="default-btn" network={TELOS_TESTNET}>
                <Trans>Buy</Trans>
              </BuyLink>
            </div>
            <a
              href="https://docs.omnidex.finance/"
              target="_blank"
              rel="noreferrer"
              className="default-btn read-more"
            >
              <Trans>Read more</Trans>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
