import { NETWORK } from "../constants/networks";
import { KnownToken, LabelledToken } from "../types/tokens";

export const networkTokens: Record<string, LabelledToken[]> = {
    [NETWORK.ARBITRUM_MAINNET]: [
        {
            address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
            knownToken: KnownToken.ETH,
        },
        {
            address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
            knownToken: KnownToken.BTC,
        },
        {
            address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
            knownToken: KnownToken.LINK,
        },
        {
            address: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
            knownToken: KnownToken.UNI,
        }
    ],
    [NETWORK.ARBITRUM_RINKEBY]: [
        {
            address: "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681",
            knownToken: KnownToken.ETH,
        },
        {
            address: "0x5360425C5dd9a3B3a41F619515F9318caA34CfC9",
            knownToken: KnownToken.BTC,
        },
    ],
    [NETWORK.TELOS_TESTNET]: [
        {
            address: "0x2433D3c00128d1B5C2D241bFAA61aFD6b22810D6",
            knownToken: KnownToken.ETH,
        },
        {
            address: "0xA9F175d3eEB1483d8Ad31D38b5673C951720C49a",
            knownToken: KnownToken.BTC,
        },
    ],
    [NETWORK.ARBITRUM_GOERLI]: [
        {
            address: "0x08466D6683d2A39E3597500c1F17b792555FCAB9",
            knownToken: KnownToken.ETH,
        },
        {
            address: "0x4CC823834038c92CFA66C40C7806959529A3D782",
            knownToken: KnownToken.BTC,
        },
        {
            address: "0x6E7155bde03E582e9920421Adf14E10C15dBe890",
            knownToken: KnownToken.LINK,
        },
    ],
};

// map of known network tokens
export const KnownTokenMap: Record<NETWORK, Record<string, KnownToken>> = Object.keys(networkTokens).reduce(
    (o, k) => ({
        ...o,
        [k]: networkTokens[k].reduce(
            (tokens, labelledToken) => ({
                ...tokens,
                [labelledToken.address]: labelledToken.knownToken,
            }),
            {}
        ),
    }),
    {} as Record<NETWORK, Record<string, KnownToken>>
);
