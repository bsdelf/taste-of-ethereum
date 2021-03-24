// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Hello {
    address owner_;
    string text_;

    constructor(string memory text) {
        owner_ = msg.sender;
        text_ = text;
    }

    function getText() public view returns (string memory) {
        return text_;
    }

    function setText(string memory text) external {
        require(msg.sender == owner_, "Sender not authorized.");
        text_ = text;
    }
}
