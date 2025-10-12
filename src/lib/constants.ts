// Business constants for Explore Sensei - Pavement Performance Suite
// Supporting both Virginia and North Carolina contractor licensing

// Virginia and North Carolina contractor licensing information
export const CONTRACTOR_LICENSING_INFO = {
  virginia: {
    classC: {
      description: 'Class C - Specialty Trades (Paving)',
      requirements: [
        'Minimum 2 years experience in paving',
        'Pass PSI examination',
        'Proof of insurance',
        'Business registration'
      ],
      examInfo: {
        provider: 'PSI Services',
        subjects: ['Paving techniques', 'Safety regulations', 'Business practices'],
        passingScore: 70
      }
    }
  },
  northCarolina: {
    limited: {
      description: 'Limited License - Specialty Contractor',
      requirements: [
        'Minimum 2 years experience in specialty trade',
        'Pass examination',
        'Proof of insurance',
        'Business registration'
      ],
      examInfo: {
        provider: 'North Carolina Licensing Board',
        subjects: ['Trade knowledge', 'Safety regulations', 'Business practices'],
        passingScore: 70
      }
    },
    intermediate: {
      description: 'Intermediate License - General Contractor',
      requirements: [
        'Minimum 4 years experience',
        'Pass examination',
        'Proof of insurance',
        'Business registration'
      ],
      examInfo: {
        provider: 'North Carolina Licensing Board',
        subjects: ['General contracting', 'Safety regulations', 'Business practices'],
        passingScore: 70
      }
    }
  }
};

// Supported states for business operations
export const SUPPORTED_STATES = [
  {
    code: 'VA',
    name: 'Virginia',
    fullName: 'Commonwealth of Virginia',
    contractorBoard: 'Virginia Board for Contractors',
    website: 'https://www.vbc.virginia.gov/',
    licenseTypes: ['Class A', 'Class B', 'Class C'],
    specialties: ['Paving', 'Sealcoating', 'Line Striping']
  },
  {
    code: 'NC',
    name: 'North Carolina',
    fullName: 'State of North Carolina',
    contractorBoard: 'North Carolina Licensing Board for General Contractors',
    website: 'https://www.nclbgc.org/',
    licenseTypes: ['Limited', 'Intermediate', 'Unlimited'],
    specialties: ['Paving', 'Sealcoating', 'Line Striping', 'General Construction']
  }
];

// Business information
export const BUSINESS_INFO = {
  name: 'Explore Sensei',
  fullName: 'Explore Sensei - Pavement Performance Suite',
  description: 'AI-assisted development for pavement analysis and performance tracking, specifically optimized for asphalt paving and sealing, with a strategic focus on church parking lot repair, sealcoating, and line-striping',
  veteranOwned: true,
  smallBusiness: true,
  employees: {
    fullTime: 2,
    partTime: 1,
    total: 3
  },
  specialties: [
    'Church parking lot repair',
    'Sealcoating',
    'Line striping',
    'Asphalt paving',
    'Parking layout reconfiguration',
    'AI-powered pavement analysis'
  ],
  serviceAreas: [
    'Virginia',
    'North Carolina'
  ]
};

// Church-specific features
export const CHURCH_FEATURES = {
  scheduling: {
    considerations: [
      'Minimize disruption to worship services',
      'Schedule around church events',
      'Coordinate with church leadership',
      'Provide advance notice to congregation'
    ],
    preferredTimes: [
      'Monday - Thursday',
      'Early morning hours',
      'After worship services'
    ]
  },
  communication: {
    protocols: [
      'Direct communication with church leadership',
      'Regular progress updates',
      'Emergency contact procedures',
      'Post-completion follow-up'
    ]
  },
  layoutDesign: {
    features: [
      'Maximize parking spaces',
      'Improve traffic flow',
      'ADA compliance',
      'Emergency vehicle access',
      'Visitor parking designation'
    ]
  }
};

// Veteran-owned business features
export const VETERAN_FEATURES = {
  certifications: [
    'Veteran-Owned Small Business (VOSB)',
    'Service-Disabled Veteran-Owned Small Business (SDVOSB)',
    'Virginia SWaM Certification',
    'North Carolina HUB Certification'
  ],
  benefits: [
    'Government contracting preferences',
    'Set-aside opportunities',
    'Mentor-protégé programs',
    'Networking opportunities'
  ],
  compliance: {
    reporting: [
      'Annual certification renewal',
      'Employment reporting',
      'Financial reporting',
      'Performance reporting'
    ],
    documentation: [
      'DD-214 (Certificate of Release or Discharge)',
      'Business registration',
      'Insurance certificates',
      'Financial statements'
    ]
  }
};

// Performance metrics and KPIs
export const PERFORMANCE_METRICS = {
  financial: [
    'Revenue per project',
    'Profit margin',
    'Cash flow',
    'Accounts receivable turnover'
  ],
  operational: [
    'Project completion time',
    'Customer satisfaction',
    'Equipment utilization',
    'Employee productivity'
  ],
  quality: [
    'Defect rate',
    'Rework percentage',
    'Customer complaints',
    'Safety incidents'
  ]
};

// Weather considerations for both states
export const WEATHER_CONSIDERATIONS = {
  virginia: {
    seasons: {
      spring: {
        months: ['March', 'April', 'May'],
        considerations: ['Rainy season', 'Temperature fluctuations', 'Ground thawing']
      },
      summer: {
        months: ['June', 'July', 'August'],
        considerations: ['High temperatures', 'Humidity', 'Heat stress prevention']
      },
      fall: {
        months: ['September', 'October', 'November'],
        considerations: ['Ideal paving conditions', 'Temperature stability', 'Dry weather']
      },
      winter: {
        months: ['December', 'January', 'February'],
        considerations: ['Cold temperatures', 'Freeze-thaw cycles', 'Limited outdoor work']
      }
    }
  },
  northCarolina: {
    seasons: {
      spring: {
        months: ['March', 'April', 'May'],
        considerations: ['Rainy season', 'Temperature fluctuations', 'Ground thawing']
      },
      summer: {
        months: ['June', 'July', 'August'],
        considerations: ['High temperatures', 'Humidity', 'Heat stress prevention', 'Hurricane season']
      },
      fall: {
        months: ['September', 'October', 'November'],
        considerations: ['Ideal paving conditions', 'Temperature stability', 'Dry weather']
      },
      winter: {
        months: ['December', 'January', 'February'],
        considerations: ['Mild winters', 'Occasional freezing', 'Year-round work possible']
      }
    }
  }
};

// Compliance requirements
export const COMPLIANCE_REQUIREMENTS = {
  virginia: {
    licensing: {
      required: true,
      renewalPeriod: '2 years',
      continuingEducation: 'Required',
      insurance: {
        generalLiability: 'Minimum $500,000',
        workersCompensation: 'Required'
      }
    },
    reporting: {
      quarterly: ['Employment', 'Safety incidents'],
      annual: ['Financial statements', 'Tax returns']
    }
  },
  northCarolina: {
    licensing: {
      required: true,
      renewalPeriod: '1 year',
      continuingEducation: 'Required',
      insurance: {
        generalLiability: 'Minimum $500,000',
        workersCompensation: 'Required'
      }
    },
    reporting: {
      quarterly: ['Employment', 'Safety incidents'],
      annual: ['Financial statements', 'Tax returns']
    }
  }
};

// Export all constants
export default {
  CONTRACTOR_LICENSING_INFO,
  SUPPORTED_STATES,
  BUSINESS_INFO,
  CHURCH_FEATURES,
  VETERAN_FEATURES,
  PERFORMANCE_METRICS,
  WEATHER_CONSIDERATIONS,
  COMPLIANCE_REQUIREMENTS
};
