import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css'; 

const CertificateSystemABI = [
  
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "certificateId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "recipientName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "courseName",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "issueDate",
          "type": "uint256"
        }
      ],
      "name": "CertificateIssued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "certificateId",
          "type": "uint256"
        }
      ],
      "name": "CertificateRevoked",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_certificateId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_recipientName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_courseName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_issueDate",
          "type": "uint256"
        }
      ],
      "name": "issueCertificate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_certificateId",
          "type": "uint256"
        }
      ],
      "name": "revokeCertificate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "certificateCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "certificates",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "certificateId",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "recipientName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "courseName",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "issueDate",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isValid",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCertificateCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_certificateId",
          "type": "uint256"
        }
      ],
      "name": "verifyCertificate",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  
];

const contractAddress = '0xc22e2b2561c83d39905f35f766c7255b4ec19685'; 

function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [verificationResult, setVerificationResult] = useState('');

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(web3Instance);
          const contractInstance = new web3Instance.eth.Contract(CertificateSystemABI, contractAddress);
          setContract(contractInstance);
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);
        } else {
          console.log('Please install MetaMask extension!');
        }
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    };
    initWeb3();
  }, []);

  const fetchCertificates = async () => {
    try {
      const count = await contract.methods.getCertificateCount().call();
      const fetchedCertificates = [];
      for (let i = 1; i <= count; i++) {
        const certificate = await contract.methods.certificates(i).call();
        fetchedCertificates.push(certificate);
      }
      setCertificates(fetchedCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchCertificates();
    }
  }, [contract]);

  const issueCertificate = async () => {
    try {
      
      const issueDateTimestamp = new Date(issueDate).getTime() / 1000;
      if (isNaN(issueDateTimestamp)) {
        console.error('Invalid issue date format');
        return;
      }
  
      
      const existingCertificate = certificates.find(certificate => certificate.certificateId.toString() === certificateId.toString());
      if (existingCertificate) {
        console.error('Certificate ID already exists');
        return;
      }
  
     
      await contract.methods.issueCertificate(
        certificateId,
        recipientName,
        courseName,
        issueDateTimestamp
      ).send({ from: accounts[0] });
      console.log('Certificate issued successfully!');
      
      fetchCertificates();
    } catch (error) {
      console.error('Error issuing certificate:', error);
    }
  };
  

  const verifyCertificate = async () => {
    try {
     
      const isValid = await contract.methods.verifyCertificate(certificateId).call();
      setVerificationResult(isValid ? 'Valid' : 'Invalid');
    } catch (error) {
      console.error('Error verifying certificate:', error);
    }
  };

  return (
    <div className="App">
      <h1 className="app-title">Online Course/Training Program System</h1>
      <div className="issue-certificate">
        <h2>Course Details</h2>
        <input
          type="text"
          placeholder="Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          className="issue-certificate__input"
        />
        <input
          type="text"
          placeholder="Recipient's Name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          className="issue-certificate__input"
        />
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="issue-certificate__input"
        />
        <input
          type="date"
          placeholder="Issue Date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          className="issue-certificate__input"
        />
        <button onClick={issueCertificate} className="issue-certificate__button">
          Issue Certificate
        </button>
      </div>
      <div className="certificate-verification">
        <h2>Verify Completion</h2>
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          className="verification__input"
        />
        <button onClick={verifyCertificate} className="verification__button">
          Verify
        </button>
        {verificationResult && <p>Verification Result: {verificationResult}</p>}
      </div>
      <div className="certificate-list">
        <h2>Completed Courses</h2>
        <table className="certificate-list__table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Recipient Name</th>
              <th>Course Name</th>
              <th>Completion Date</th>
            </tr>
          </thead>
          <tbody>
          {certificates.map((certificate, index) => (
  <tr key={index}>
    <td>{certificate.certificateId.toString()}</td>
    <td>{certificate.recipientName}</td>
    <td>{certificate.courseName}</td>
    <td>{new Date(Number(certificate.issueDate) * 1000).toLocaleDateString()}</td>
  </tr>
))}

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
