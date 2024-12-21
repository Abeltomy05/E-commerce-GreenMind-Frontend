import * as React from 'react';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const BasicPagination = ({ count, onChange }) => {
  return (
    <Stack spacing={2}>
      <Pagination 
        count={count} 
        color="primary" 
        onChange={onChange}
        size="large"
      />
    </Stack>
  );
};

export default BasicPagination;