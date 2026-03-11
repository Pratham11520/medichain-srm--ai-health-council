"""
MediChain Hash Ledger Service (Prototype)
Blockchain-inspired tamper-evident record chaining with SHA-256.
NOTE: This is a prototype-level simulation — client-side, in-memory,
no distributed nodes, no consensus, no immutability guarantees.
Honest description: "Blockchain-inspired hash ledger simulation
for tamper-evident record chaining (prototype level)"
"""

import hashlib
import json
import time
from typing import List, Optional
from pydantic import BaseModel


class Block(BaseModel):
    index: int
    timestamp: float
    data: str
    previousHash: str
    hash: str


class HashLedger:
    """
    Prototype hash ledger — chains records using SHA-256 hashes.
    Not a real blockchain: no distributed nodes, no consensus, no persistence.
    """

    def __init__(self):
        self.chain: List[Block] = [self.create_genesis_block()]

    def create_genesis_block(self) -> Block:
        return Block(
            index=0,
            timestamp=time.time(),
            data="Genesis Block - MediChain Hash Ledger Initialized (Prototype)",
            previousHash="0",
            hash="816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7"
        )

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def calculate_hash(self, index: int, previous_hash: str, timestamp: float, data: str) -> str:
        value = str(index) + str(previous_hash) + str(timestamp) + str(data)
        return hashlib.sha256(value.encode('utf-8')).hexdigest()

    def add_block(self, data: str) -> Block:
        previous_block = self.get_latest_block()
        new_index = previous_block.index + 1
        new_timestamp = time.time()
        new_hash = self.calculate_hash(new_index, previous_block.previousHash, new_timestamp, data)

        new_block = Block(
            index=new_index,
            timestamp=new_timestamp,
            data=data,
            previousHash=previous_block.hash,
            hash=new_hash
        )
        self.chain.append(new_block)
        return new_block

    def is_valid(self) -> bool:
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]

            if current.previousHash != previous.hash:
                return False

            recalculated = self.calculate_hash(current.index, current.previousHash, current.timestamp, current.data)
            if current.hash != recalculated:
                return False
        return True


# Singleton
secure_ledger = HashLedger()
