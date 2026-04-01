// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin v5 compatible — Counters.sol was removed in v5.
// Use a plain uint256 instead, which is the recommended approach.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MoodNFT
/// @notice A minimal ERC721 NFT contract where users mint with their own IPFS metadata URI.
contract MoodNFT is ERC721, Ownable {

    // ─── State ────────────────────────────────────────────────────────────────

    /// @dev Tracks the next token ID to be minted. Starts at 0.
    uint256 private _nextTokenId;

    /// @dev Maps each token ID to its IPFS metadata URI.
    mapping(uint256 => string) private _tokenURIs;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() ERC721("MoodNFT", "MOOD") Ownable(msg.sender) {}

    // ─── External / Public ────────────────────────────────────────────────────

    /// @notice Mint a new MoodNFT to the caller.
    /// @param uri  IPFS metadata URI (e.g. ipfs://Qm...)
    function mint(string calldata uri) external {
        require(bytes(uri).length > 0, "MoodNFT: URI cannot be empty");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _tokenURIs[tokenId] = uri;

        emit Minted(msg.sender, tokenId, uri);
    }

    /// @notice Returns the metadata URI for a given token.
    /// @param tokenId  The token whose URI to look up.
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        _requireOwned(tokenId); // Reverts with ERC721NonexistentToken if not minted
        return _tokenURIs[tokenId];
    }

    /// @notice Returns the total number of tokens minted so far.
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
