<!-- {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PermitirLeituraPublica",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::s3-teste-2/*"
    }
  ]
} --> bucket policy para todos lerem os arquivos mas somente teu iam pode administrar o mesmo

basicamente fazendo um role do s3 funcionar, hehe
